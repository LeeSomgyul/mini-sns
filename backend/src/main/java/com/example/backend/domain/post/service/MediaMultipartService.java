package com.example.backend.domain.post.service;

import com.example.backend.domain.post.dto.file.*;
import com.example.backend.common.exception.FileProcessException;
import com.example.backend.common.exception.InvalidRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import com.example.backend.domain.post.dto.file.FileType;
import software.amazon.awssdk.services.s3.presigner.model.PresignedUploadPartRequest;
import software.amazon.awssdk.services.s3.presigner.model.UploadPartPresignRequest;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaMultipartService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${minio.bucket}")
    private String bucket;

    //1.업로드 시작: minio에게 uploadId를 받아와서 objectKey와 함께 프론트에게 전달
    public CreateMultipartResponse createUpload (Long authorId, CreateMultipartRequest request){

        //[보안] 1GB 용량 초과 체크
        long maxLimit = 1024L * 1024L * 1024L;
        if(request.fileSize() > maxLimit){
            throw new FileProcessException("허용된 최대 파일 크기(1GB)를 초과하였습니다.");
        }

        //[보안] 확장자 검증 (예: 비디오를 올렸는데 다른 확장자인 경우 방어)
        if(request.fileType() == FileType.VIDEO && !request.contentType().startsWith("video/")){
            throw new FileProcessException("올바르지 않은 미디어 형식입니다.");
        }

        //파일 확장자 추출 및 검증
        String extension = extractExtension(request.filename());
        validateExtension(extension);

        //파일명 난수로 바꾸기
        String fileName = UUID.randomUUID() + extension;

        //파일타입별로 이름 나누기(이미지, 비디오, 썸네일)
        String folderType = determineFolderType(request.fileType());

        //최종 저장될 DB 경로(objectKey) 확정
        String objectKey = String.format("posts/user_%d/%s/%s", authorId, folderType, fileName);

        try{
            //minio에게 조각내서 파일 전송한다고 요청
            CreateMultipartUploadRequest createRequest = CreateMultipartUploadRequest.builder()
                    .bucket(bucket)
                    .key(objectKey)
                    .contentType(request.contentType())
                    .build();

            CreateMultipartUploadResponse createResponse = s3Client.createMultipartUpload(createRequest);

            //발급받은 uploadId와 objectKey를 프론트엔드에 전달
            return CreateMultipartResponse.of(createResponse.uploadId(), objectKey);
        }catch(Exception e){
            log.error("Multipart 업로드 요청 실패: {}", e.getMessage(), e);
            throw new FileProcessException("업로드 초기화에 실패했습니다.");
        }
    }

    //2.서명: 조각(partNumber)별 Presigned URL 발급
    public SignPartResponse signPart (SignPartRequest request){

        //[보안] uploadId 발급 후 1GB(=5M씩 205조각) 초과 미디어 등록하는 경우 차단
        if(request.partNumber() > 205){
            log.warn("[보안 위반 감지] 허용된 조각 번호(205)를 초과한 요청 유입. ObjectKey: {}", request.objectKey());
            throw new FileProcessException("올바르지 않은 업로드 요청입니다.");
        }

        try{
            //어떤 파일(key)의 어떤 작업(uploadId) 중 몇 번째 조각(partNumber)인지 설정
            UploadPartRequest uploadPartRequest = UploadPartRequest.builder()
                    .bucket(bucket)
                    .key(request.objectKey())
                    .uploadId(request.uploadId())
                    .partNumber(request.partNumber())
                    .build();

            //Presigned URL 유효 시간 설정 (15분)
            UploadPartPresignRequest partPresignRequest = UploadPartPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(15))
                    .uploadPartRequest(uploadPartRequest)
                    .build();

            //Presigned URL 생성
            PresignedUploadPartRequest presignedUploadPartRequest = s3Presigner.presignUploadPart(partPresignRequest);
            String presignedUrl = presignedUploadPartRequest.url().toString();

            //생성된 Presigned URL을 프론트엔드에 전달
            return SignPartResponse.of(presignedUrl);
        }catch(Exception e){
            log.error("Presigned Url 발급 실패: {}", e.getMessage(), e);
            throw new FileProcessException("Presigned URL 생성에 실패하였습니다.");
        }
    }

    //3.확인: minio에 조각들이 잘 도착했나 확인 (전송은 2번과 3번 사이에서 프론트에서 함)
    public MultipartListPartsResponse listParts (String uploadId, String objectKey){
        try{
            ListPartsRequest listPartsRequest = ListPartsRequest.builder()
                    .bucket(bucket)
                    .key(objectKey)
                    .uploadId(uploadId)
                    .build();

            ListPartsResponse listPartsResponse = s3Client.listParts(listPartsRequest);

            //AWS에서 제공하는 객체 형식을 내가 만든 PartInfo 형식으로 변환
            List<MultipartListPartsResponse.PartInfo> partInfos = listPartsResponse.parts().stream()
                    .map(part -> new MultipartListPartsResponse.PartInfo(
                            part.partNumber(),
                            part.size(),
                            part.eTag()
                    ))
                    .toList();

            //프론트엔드에 전달
            return MultipartListPartsResponse.builder()
                    .parts(partInfos)
                    .build();
        }catch(Exception e){
            log.error("업로드된 조각 목록 조회 실패: {}", e.getMessage(), e);
            throw new FileProcessException("조각 목록 조회에 실패했습니다.");
        }
    }

    //4.조립: 조각들 합치기
    public CompleteResponse completeMultipart (CompleteRequest request){
        try{
            //프론드엔드가 준 parts를 AWS에 형식에 맞춰서 변환
            List<CompletedPart> completedParts = request.parts().stream()
                    .map(part -> CompletedPart.builder()
                            .partNumber(part.partNumber())
                            .eTag(part.eTag())
                            .build()
                    )
                    .toList();

            //합체할 조각들의 정보
            CompletedMultipartUpload completedMultipartUpload = CompletedMultipartUpload.builder()
                    .parts(completedParts)
                    .build();


            //서버에 전송할 최종 합체 명령
            CompleteMultipartUploadRequest completeMultipartUploadRequest = CompleteMultipartUploadRequest.builder()
                    .bucket(bucket)
                    .key(request.objectKey())
                    .uploadId(request.uploadId())
                    .multipartUpload(completedMultipartUpload)
                    .build();

            CompleteMultipartUploadResponse completeMultipartUploadResponse = s3Client.completeMultipartUpload(completeMultipartUploadRequest);

            //프론트에 전달: 합체된 파일이 있는 minio의 위치
            return CompleteResponse.of(completeMultipartUploadResponse.location());
        }catch(Exception e){
            log.error("Multipart 조립 실패: {}", e.getMessage(), e);
            throw new FileProcessException("파일 조립에 실패했습니다.");
        }
    }

    //5.업로드 취소
    public void abortUpload(String uploadId, String objectKey){
        try{
            //어떤 작업을 삭제할 것인지 확인
            AbortMultipartUploadRequest abortMultipartUploadRequest = AbortMultipartUploadRequest.builder()
                    .bucket(bucket)
                    .key(objectKey)
                    .uploadId(uploadId)
                    .build();

            //업로드 중단
            s3Client.abortMultipartUpload(abortMultipartUploadRequest);
            log.info("Multipart 업로드 취소 완료: {}", objectKey);
        }catch(Exception e){
            log.error("Multipart 업로드 취소 실패: {}", e.getMessage(), e);
            throw new FileProcessException("업로드 취소에 실패했습니다.");
        }
    }


    //[메서드]-----------------------
    //파일 확장자 추출
    private String extractExtension(String originalFilename){
        if(originalFilename == null || !originalFilename.contains(".")){
            throw new InvalidRequestException("잘못된 파일명입니다.");
        }
        return originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
    }

    //허용된 확장자만 통과
    private void validateExtension(String extension){
        if(!extension.equals(".jpg") && !extension.equals(".png") && !extension.equals(".mp4")){
            throw new InvalidRequestException("JPG, PNG, MP4 만 업로드 가능합니다.");
        }
    }

    //minio에 저장하는 파일 경로를 타입별로 나누기
    private String determineFolderType(FileType fileType){
        return switch (fileType){
            case VIDEO -> "videos";
            case IMAGE -> "images";
            case THUMBNAIL -> "thumbnails";
        };
    }
}
