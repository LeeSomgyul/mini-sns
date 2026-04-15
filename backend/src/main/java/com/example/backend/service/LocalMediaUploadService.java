package com.example.backend.service;

import com.example.backend.exception.FileStorageException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

//🚨🚨일단 로컬에 미디어파일(영상, 이미지) 저장 -> 나중에 S3으로 변경🚨🚨
@Service
public class LocalMediaUploadService implements MediaUploadService{

    private final Path uploadPath;

    //로컬에 저장될 폴더 경로
    public LocalMediaUploadService(@Value("${file.upload-dir}") String uploadDir){
        //문자열이었던 파일 경로를 Path 객체로 변환 후, 절대 경로로 변경
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();

        //폴더가 없다면 생성
        try{
            Files.createDirectories(this.uploadPath);
        }catch(Exception e){
            throw new FileStorageException("파일 업로드 폴더를 생성할 수 없습니다.");
        }
    }

    //프론트에서 받은 원본 파일(영상, 이미지) 저장
    @Override
    public String uploadOriginalFile(MultipartFile file) {
        return saveFile(file);
    }

    //썸네일 이미지 파일 저장
    @Override
    public String generateThumbnail(String videoPath) {
        return "";
    }

    //원본 파일을 url형식으로 변경한 뒤 -> DB에 저장
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

            Path filePath = this.uploadPath.resolve(newFilename);//문자형을 실제 파일 형태로 변환
            file.transferTo(filePath);//파일을 파일경로로 저장

            //프론트에서 저장된 파일을 끌어와서 사용할 수 있도록 return (WebConfig.java 필요)
            return "/image/" + newFilename;
        }catch(IOException e){
            throw new FileStorageException("파일 저장 중 오류가 발생했습니다.");
        }
    }


}
