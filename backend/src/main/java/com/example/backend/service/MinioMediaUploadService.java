package com.example.backend.service;

import com.example.backend.exception.FileProcessException;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Primary
@RequiredArgsConstructor
public class MinioMediaUploadService implements MediaUploadService{

    private final MinioClient minioClient;

    @Value("${minio.bucket}")
    private String bucket;

    //프론트에서 받은 원본 파일(영상, 이미지)을 MINIO에 저장
    //return: 프론트에서 사용 가능한 파일 url 상대경로
    @Override
    public String uploadOriginalFile(MultipartFile file) {
        try{
            String originalFilename = file.getOriginalFilename();//파일 이름 + 확장자
            String extension = ""; //확장자

            if(originalFilename != null && originalFilename.contains(".")){
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String newFilename = UUID.randomUUID() + extension; //새로운 파일 이름

            //MINIO에 업로드
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucket)
                            .object(newFilename)
                            .stream(file.getInputStream(), file.getSize(), -1L)
                            .contentType(file.getContentType())
                            .build()
            );

            return "/minio/" + bucket + "/" + newFilename;
        }catch(Exception e){
            throw new FileProcessException("파일 저장 중 오류가 발생했습니다.");
        }
    }

    @Override
    public String generateThumbnail(String videoUrl) {

        String videoFilename = videoUrl.substring(videoUrl.lastIndexOf("/") + 1);
        String thumbnailFilename = "thumb_" + videoFilename.substring(0, videoFilename.lastIndexOf(".")) + ".jpg";

        //비디오, 썸네일이미지 파일을 임시로 내 서버에 저장
        Path tempVideoPath = null;
        Path tempThumbnailPath = null;

        //MINIO에 저장된 파일을 가져와서 -> 내 서버(로컬)에 비디오 임시 다운로드
        try{

            tempVideoPath = Files.createTempFile("minio_video_", videoFilename);

            //minio에서 데이터객체 가져오기
            try(InputStream stream = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucket)
                            .object(videoFilename)
                            .build()
            )){
                //내 서버에 저장
                Files.copy(stream, tempVideoPath, StandardCopyOption.REPLACE_EXISTING);
            }

            tempThumbnailPath = Files.createTempFile("minio_thumb_", ".jpg");

            //FFmpeg 실행
            ProcessBuilder pb = new ProcessBuilder(
                    "ffmpeg",//FFmpeg 실행
                    "-i", tempVideoPath.toString(),//입력 파일
                    "-ss", "00:00:00.500",//영상을 어디부터 읽을지 (0.5초 지점)
                    "-vframes", "1",//비디오 프레임 1장만 추출
                    "-q:v", "2",//화질(낮을수록 고화질)
                    tempThumbnailPath.toString(),//저장될 장소
                    "-y"//같은 이름 있으면 덮어쓰기
            );

            pb.inheritIO();//FFmpeg 진행상황 출력
            pb.start().waitFor();//실행 및 대기

            //생성된 썸네일을 다시 MINIO에 업로드
            try(InputStream thumbStream = Files.newInputStream(tempThumbnailPath)){
                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(bucket)
                                .object(thumbnailFilename)
                                .stream(thumbStream, Files.size(tempThumbnailPath), -1L)
                                .contentType("image/jpeg")
                                .build()
                );
            }

            return "/minio/" + bucket + "/" + thumbnailFilename;
        }catch(Exception e){
            throw new FileProcessException("비디오 처리 중 오류가 발생했습니다.");
        }finally {
            //내 서버에 저장했던 비디오, 썸네일 임시 파일을 삭제
            try{
                if(tempVideoPath != null) Files.deleteIfExists(tempVideoPath);
                if(tempThumbnailPath != null) Files.deleteIfExists(tempThumbnailPath);
            }catch(Exception e){
                throw new FileProcessException("비디오 처리 중 오류가 발생했습니다.");
            }
        }
    }
}
