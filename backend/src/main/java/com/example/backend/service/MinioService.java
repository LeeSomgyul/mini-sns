package com.example.backend.service;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.PresignedUrlRequest;
import com.example.backend.dto.PresignedUrlResponse;
import com.example.backend.exception.FileProcessException;
import com.example.backend.exception.InvalidRequestException;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.Http;
import io.minio.MinioClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class MinioService {

    private final MinioClient minioClient;

    @Value("${minio.bucket}")
    private String bucket;

    //React가 직접 minio에 업로드할 수 있는 Presigned URL을 발급
    /*
    * authorId: 작성자 id
    * request.filename: 프론트에서 올릴 파일의 원래 이름 (예: video.mp4)
    * request.fileType: 프론트에서 올릴 파일의 타입 (예: IMAGE, VIDEO, THUMBNAIL)
    * return: 발급된 Presigned URL 및 파일이 저장될 최종 경로가 담긴 객체
    */
    public PresignedUrlResponse generatePresignedUrl (Long authorId, PresignedUrlRequest request){
        //파일 확장자 추출 및 검증
        String extension = extractExtension(request.filename());
        validateExtension(extension);

        //파일명 난수로 바꾸기
        String fileName = UUID.randomUUID() + extension;

        //파일타입별로 이름 나누기(이미지, 비디오, 썸네일)
        String folderType = determineFolderType(request.fileType());
        String objectKey = String.format("posts/user_%d/%s/%s", authorId, folderType, fileName);//minio에 저장될때의 파일명

        try{
            //minio Presigned URL 생성 요청
            String presignedUrl = minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Http.Method.PUT)
                            .bucket(bucket)
                            .object(objectKey)
                            .expiry(5, TimeUnit.MINUTES)//5분동안 유효
                            .build()
            );

            return new PresignedUrlResponse(presignedUrl, objectKey);
        }catch(Exception e){
            log.error("파일 업로드 에러:", e);
            throw new FileProcessException("파일 업로드 URL 생성에 실패했습니다.");
        }

    }


    //[메서드] 파일 확장자 추출
    private String extractExtension(String originalFilename){
        if(originalFilename == null || !originalFilename.contains(".")){
            throw new InvalidRequestException("잘못된 파일명입니다.");
        }
        return originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
    }

    //[메서드] 허용된 확장자만 통과
    private void validateExtension(String extension){
        if(!extension.equals(".jpg") && !extension.equals(".png") && !extension.equals(".mp4")){
            throw new InvalidRequestException("JPG, PNG, MP4 만 업로드 가능합니다.");
        }
    }

    //[메서드] minio에 저장하는 파일 경로를 타입별로 나누기
    private String determineFolderType(PresignedUrlRequest.FileType fileType){
            return switch (fileType){
                case VIDEO -> "videos";
                case IMAGE -> "images";
                case THUMBNAIL -> "thumbnails";
            };
    }
}
