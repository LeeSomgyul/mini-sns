package com.example.backend.service;

import com.example.backend.dto.file.*;
import com.example.backend.exception.FileProcessException;
import com.example.backend.exception.InvalidRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedUploadPartRequest;
import software.amazon.awssdk.services.s3.presigner.model.UploadPartPresignRequest;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserProfileMultipartService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${minio.bucket}")
    private String bucket;

    // [1단계] 프로필 이미지 분할 업로드 시작
    // - MiniO 서버에 이미지 저장 공간을 생성하여 발급받은 userId와 objectKey(MiniO 저장경로)를 프론트엔드에 반환
    public ProfileCreateMultipartResponse profileCreateUpload(Long userId, ProfileCreateMultipartRequest request){
        // 1. [예외] 프로필 이미지 크기 검증 (최대 10MB 제한)
        long maxLimit = 10L * 1024L * 1024L;
        if(request.fileSize() > maxLimit){
            throw new FileProcessException("프로필 이미지는 최대 10MB까지만 업로드 가능합니다.");
        }

        // 2. [예외] 프로필 이미지 타입 확인
        if(request.contentType() == null || !request.contentType().startsWith("image/")){
            throw new FileProcessException("이미지 파일만 업로드할 수 있습니다.");
        }

        // 3. [예외] 확장자 확인
        String extension = extractExtension(request.filename());
        validateExtension(extension);

        // 4. 파일명을 난수로 변경
        String uniqueFileName = UUID.randomUUID() + extension;

        // 5. 최종 MiniO 저장 경로 생성
        // - 예시 결과: profiles/user_12/images/6fc318f5-7d31-4384-8c27-56a6006d8f84.jpg
        String objectKey = String.format("profiles/user_%d/images/%s", userId, uniqueFileName);

        // 6. MiniO에게 파일 조각내서 전송할 것이라고 요청
        try{
            CreateMultipartUploadRequest createReqeust = CreateMultipartUploadRequest.builder()
                    .bucket(bucket)
                    .key(objectKey)
                    .contentType(request.contentType())
                    .build();

            CreateMultipartUploadResponse createResponse = s3Client.createMultipartUpload(createReqeust);

            log.info("프로필 Multipart 업로드 요청 성공. ObjectKey: {}", objectKey);

            return ProfileCreateMultipartResponse.of(createResponse.uploadId(), objectKey);
        }catch(Exception e){
            log.error("프로필 Multipart 업로드 요청 실패: {}", e.getMessage(), e);
            throw new FileProcessException("업로드 요청에 실패했습니다.");
        }
    }

    // [2단계] 이미지 조각 파일 별 Presigned URL 발급 (서명)
    // - 프론트엔드가 백엔드를 거치지 않고 MiniO에 직접 이미지 파일 조각을 올리는 주소를 발급
    public ProfileSingPartResponse profileSignPart(ProfileSingPartRequest request){
        // 1. 프로필 파일 용량 10MB에 맞춰서 5조각 초과 체크
        if(request.partNumber() > 5){
            throw  new FileProcessException("올바르지 않은 업로드 요청입니다.");
        }

        // 2. 프론트엔드에게 조각별 주소 발급 후 전달 로직
        try{
            // 어떤 이미지 파일(key)의 어떤 작업(userId) 중 몇 번쨰 조각(partNumber)인지 셋팅
            UploadPartRequest uploadPartRequest = UploadPartRequest.builder()
                    .bucket(bucket)
                    .key(request.objectKey())
                    .uploadId(request.uploadId())
                    .partNumber(request.partNumber())
                    .build();

            // 주소 존재 유효 시간 15분으로 설정
            UploadPartPresignRequest uploadPartPresignRequest = UploadPartPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(15))
                    .uploadPartRequest(uploadPartRequest)
                    .build();

            // 조각별 MiniO에 저장할 업로드 주소(Presigned URL) 생성
            PresignedUploadPartRequest presignedUploadPartRequest = s3Presigner.presignUploadPart(uploadPartPresignRequest);
            String presignedUrl = presignedUploadPartRequest.url().toString();

            // 생성된 Presigned URL을 프론트엔드(Uppy)로 전송
            return ProfileSingPartResponse.of(presignedUrl);

        } catch (Exception e) {
            log.error("프로필 Presigned Url 발급 실패: {}", e.getMessage());
            throw new FileProcessException("업로드 주소 생성에 실패하였습니다.");
        }
    }

    // [3단계] 프론트엔드가 MiniO에 Presigned URL로 파일을 잘 저장했는지 리스트 꺼내서 확인
    public ProfileMultipartListPartsResponse profileListParts(String uploadId, String objectKey){
        try{
            // 1. MiniO에게 특정 업로드 작업(uploadId)의 조각 조회 요청
            ListPartsRequest listPartsRequest = ListPartsRequest.builder()
                    .bucket(bucket)
                    .key(objectKey)
                    .uploadId(uploadId)
                    .build();

            ListPartsResponse listPartsResponse = s3Client.listParts(listPartsRequest);

            // 2. AWS에서 보내준 경로를 읽기 쉬운 JSON 형식으로 변환
            List<ProfileMultipartListPartsResponse.PartInfo> partInfos = listPartsResponse.parts().stream()
                    .map(part -> ProfileMultipartListPartsResponse.PartInfo.of(
                            part.partNumber(),
                            part.size(),
                            part.eTag()
                    ))
                    .toList();

            log.info("업로드 조각 확인 완료. ObjectKey: {}, 발견된 조각 수: {}", objectKey, partInfos.size());

            return ProfileMultipartListPartsResponse.of(partInfos);

        }catch(Exception e){
            log.error("프로필 업로드 조각 목록 조회 실패: {}", e.getMessage(), e);
            throw new FileProcessException("조각 목록 조회에 실패했습니다.");
        }
    }

    // [4단계] MiniO에서 분할된 조각들 가져와서 순서대로 합치기
    public ProfileCompleteResponse profileCompleteMultipart(ProfileCompleteRequest request){
        try{
            // 1. 프론트엔드가 준 조각 리스트를 AWS가 인식 가능한 형식으로 변형
            List<CompletedPart> completedParts = request.parts().stream()
                    .map(part -> CompletedPart.builder()
                            .partNumber(part.partNumber())
                            .eTag(part.eTag())
                            .build()
                    )
                    .toList();

            // 2. MiniO에게 내릴 최종 리스트 합치기 명령
            CompleteMultipartUploadResponse completeResponse = s3Client.completeMultipartUpload(builder -> builder
                    .bucket(bucket)
                    .key(request.objectKey())
                    .uploadId(request.uploadId())
                    .multipartUpload(uploadBuilder -> uploadBuilder.parts(completedParts))
            );

            log.info("프로필 이미지 조각 합체 완료! 최종 저장 위치: {}", completeResponse.location());

            return ProfileCompleteResponse.of(completeResponse.location());

        }catch (Exception e){
            log.error("프로필 Multipart 조립 실패: {}", e.getMessage(), e);
            throw new FileProcessException("파일 조립에 실패했습니다.");
        }
    }

    // [5단계] 프로필 이미지 분할 업로드 시 사용자가 중간에 취소한 경우, MiniO 서버에 저장된 파편들 제거
    public void profileAbortUpload(String uploadId, String objectKey){
        try{
            s3Client.abortMultipartUpload(builder -> builder
                    .bucket(bucket)
                    .key(objectKey)
                    .uploadId(uploadId)
            );

            log.info("프로필 Multipart 업로드 취소 및 임시 조각 청소 완료. ObjectKey: {}", objectKey);
        }catch (Exception e){
            log.error("프로필 Multipart 업로드 취소 실패: {}", e.getMessage(), e);
            throw new FileProcessException("업로드 취소 처리 중 오류가 발생했습니다.");
        }
    }


    //[메서드]-----------------------
    // 파일 확장자 추출
    private String extractExtension(String originalFilename){
        if(originalFilename == null || !originalFilename.contains(".")){
            throw new InvalidRequestException("잘못된 파일명입니다.");
        }
        return originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
    }

    //허용된 확장자만 통과
    private void validateExtension(String extension){
        if(!extension.equals(".jpg") && !extension.equals(".png") && !extension.equals(".jpeg")){
            throw new InvalidRequestException("프로필 이미지는 JPG, JPEG, PNG 형식만 허용됩니다.");
        }
    }
}
