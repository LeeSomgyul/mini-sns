package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PresignedUrlRequest (
        @NotBlank(message = "파일명은 필수입니다.")
        String filename,

        @NotNull(message = "파일 타입은 필수입니다.")
        FileType fileType
){
    public enum FileType{
        IMAGE,//원본 이미지
        VIDEO,//원본 영상
        THUMBNAIL//영상에서 추출한 썸네일 이미지
    }
}
