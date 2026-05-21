package com.example.backend.dto.file.Multipart;

import com.example.backend.dto.file.FileType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;


public record CreateMultipartRequest (
        @NotBlank(message = "파일명은 필수입니다.")
        String filename,

        @NotNull(message = "파일 타입은 필수입니다.")
        FileType fileType,

        @NotBlank(message = "컨텐츠 타입은 필수입니다.")
        String contentType,

        @NotNull(message = "파일 크기는 필수입니다.")
        @Positive(message = "올바르지 않은 파일 크기입니다.")
        Long fileSize
){}