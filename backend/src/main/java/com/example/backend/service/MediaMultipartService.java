package com.example.backend.service;

import com.example.backend.dto.file.Multipart.CreateMultipartRequest;
import com.example.backend.dto.file.Multipart.CreateMultipartResponse;
import com.example.backend.dto.file.Multipart.SingPartRequest;
import com.example.backend.dto.file.Multipart.SingPartResponse;
import com.example.backend.exception.FileProcessException;
import com.example.backend.exception.InvalidRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateMultipartUploadRequest;
import software.amazon.awssdk.services.s3.model.CreateMultipartUploadResponse;
import software.amazon.awssdk.services.s3.model.UploadPartRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import com.example.backend.dto.file.FileType;
import software.amazon.awssdk.services.s3.presigner.model.PresignedUploadPartRequest;
import software.amazon.awssdk.services.s3.presigner.model.UploadPartPresignRequest;

import java.time.Duration;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaMultipartService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${minio.bucket}")
    private String bucket;

    //1.업로드 시작: 백엔드에서 objectKey와 uploadId를 받아옴
    public CreateMultipartResponse CreateMultipart (Long authorId, CreateMultipartRequest request){
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

    //2.조각(partNumber)별 Presigned URL 발급
    public SingPartResponse singPart (SingPartRequest request){
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
            return SingPartResponse.of(presignedUrl);
        }catch(Exception e){
            log.error("Presigned Url 발급 실패: {}", e.getMessage(), e);
            throw new FileProcessException("Presigned URL 생성에 실패하였습니다.");
        }
    }

    //3.MiniO에게 Presigned URL로 조각으로 나눠진 미디어 데이터 전송


    //4.조각 하나로 조립

    //5.업로드 취소



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
