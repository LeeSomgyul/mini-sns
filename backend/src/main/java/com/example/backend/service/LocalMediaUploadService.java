package com.example.backend.service;

import com.example.backend.exception.FileProcessException;
import com.example.backend.exception.InvalidRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

//🚨🚨일단 로컬에 미디어파일(영상, 이미지) 저장 -> 나중에 S3으로 변경🚨🚨
@Service
@Slf4j
public class LocalMediaUploadService implements MediaUploadService{

    private final Path rootPath;

    //들어온 videoUrl 검증
    public LocalMediaUploadService(@Value("${file.upload-dir}") String videoUrl){
        //문자열이었던 파일 경로를 Path 객체로 변환 후, 절대 경로로 변경
        this.rootPath = Paths.get(videoUrl).toAbsolutePath().normalize();

        //폴더가 없다면 생성
        try{
            Files.createDirectories(this.rootPath);
        }catch(Exception e){
            log.error("LocalMediaUploadService 폴더 생성 중 오류: ", e);
            throw new FileProcessException("파일 업로드 폴더를 생성할 수 없습니다.");
        }
    }

    //프론트에서 받은 원본 파일(영상, 이미지)을 로컬에 저장
    @Override
    public String uploadOriginalFile(MultipartFile file) {
        return saveFile(file);
    }

    //FFmpeg로 영상에서 프썸네일 url 추출
    //입력: 프론트에서 접근 가능한 영상 url ("/image/video.mp4")
    //출력: 프론트에서 접근 가능한 썸네일 url ("/image/video.jpg")
    @Override
    public String generateThumbnail(String videoUrl) {

        //FFmpeg로 작업할 영상이 어디있는지 찾기
        String videoFileName = videoUrl.substring(videoUrl.lastIndexOf("/")+1);//현재 videoUrl 경로는 프론트 경로 "/image/abc.mp4" 형태로 들어오기 때문에, 파일명만 추출해야 한다.

        //동영상 파일이 실제 저장되어있는 경로
        Path videoFilePath = this.rootPath.resolve(videoFileName);

        //추출 완성한 썸네일 이미지 및 저장할 경로
        String fullVideoName = videoFileName.substring(videoFileName.lastIndexOf("/")+1);//완성 이름(아직 확정자 변경 전. ex)video.mp4)
        int dotIndex = fullVideoName.lastIndexOf(".");//.위치
        String nameOnly = (dotIndex == -1) ? fullVideoName : fullVideoName.substring(0,dotIndex);//mp4 영상 확장자 제거한 파일 이름
        String thumbnailFileName = "thumb_" + nameOnly + ".jpg";//이미지 확장자 추가 (ex. video.jpg)

        //영상 썸네일 이미지가 저장될 경로
        Path thumbnailFilePath = this.rootPath.resolve(thumbnailFileName);

        //FFmpeg로 영상 썸네일 추출 시작
        try{
            //FFmpeg 명령어 조립 (ProcessBuilder는 자바와 외부 프로그램을 이어주는 역할)
            ProcessBuilder pb = new ProcessBuilder(
                    "ffmpeg",//FFmpeg 실행
                    "-i", videoFilePath.toString(),//입력 파일
                    "-ss", "00:00:00.500",//영상을 어디부터 읽을지 (0.5초 지점)
                    "-vframes", "1",//비디오 프레임 1장만 추출
                    "-q:v", "2",//화질(낮을수록 고화질)
                    thumbnailFilePath.toString(),//저장될 장소
                    "-y"//같은 이름 있으면 덮어쓰기
            );

            //프로세스 실행
            Process process = pb.start();

            //에러코드 저장 (성공이면 0, 실패면 다른 숫자)
            int resultCode = process.waitFor();

            if(resultCode != 0){
                log.error("[FFmpeg] 썸네일 추출 실패 코드: ", resultCode);
                throw new InvalidRequestException("썸네일 추출에 실패하였습니다.");
            }

            //프론트에서 접근할 수 있는 url 출력
            return "/image/" + thumbnailFileName;

        }catch(IOException | InterruptedException e){
            //InterruptedException: 스레드 중지 오류
            if(e instanceof  InterruptedException){
                Thread.currentThread().interrupt();//오류난 스레드 작업 중지
            }
            log.error("FFmpeg 작업 중 오류 발생: ",e);
            throw new FileProcessException("비디오 처리 중 오류가 발생했습니다.");
        }
    }

    //--------- [메서드] 원본 파일을 url형식으로 변경한 뒤, 로컬에 저장 --------------
    private String saveFile(MultipartFile file){
        try{
            //파일명 중복을 막기 위해 난수 붙이기(서로 다른 사용자들이 같은 이름으로 업로드 할 수 있기 때문)
            String originalFilename = file.getOriginalFilename();//원본 파일 이름

            //확장자만 추출
            String extension = "";
            if(originalFilename != null && originalFilename.contains(".")){
               extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String newFilename = UUID.randomUUID() + extension;//새로운 파일명 생성

            Path filePath = this.rootPath.resolve(newFilename);//문자형을 실제 파일 형태로 변환
            file.transferTo(filePath);//파일을 파일경로로 저장

            //프론트에서 저장된 파일을 끌어와서 사용할 수 있도록 웹경로 반환 (WebConfig.java 필요)
            //프론트엔드에서 <img src="/images/파일명.jpg"> 사용 가능
            return "/image/" + newFilename;
        }catch(IOException e){
            throw new FileProcessException("파일 저장 중 오류가 발생했습니다.");
        }
    }


}
