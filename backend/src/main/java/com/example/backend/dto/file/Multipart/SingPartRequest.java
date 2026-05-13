package com.example.backend.dto.file.Multipart;

import jakarta.validation.constraints.NotBlank;

public record SingPartRequest (
        @NotBlank(message = "uploadId는 필수입니다.")
        String uploadId,

        @NotBlank(message = "objectKey는 필수입니다.")
        String objectKey,

        @NotBlank(message = "partNumber는 필수입니다.")
        Integer partNumber
){}