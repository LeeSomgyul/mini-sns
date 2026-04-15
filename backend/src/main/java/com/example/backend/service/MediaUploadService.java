package com.example.backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface MediaUploadService {
    //원본 파일 저장 -> 접속 가능한 url로 반환
    String uploadOriginalFile(MultipartFile file);

    //썸네일 파일 생성
    String generateThumbnail(String videoPath);
}
