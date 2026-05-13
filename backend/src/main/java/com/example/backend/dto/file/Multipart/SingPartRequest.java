package com.example.backend.dto.file.Multipart;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SingPartRequest (
        @NotBlank(message = "uploadId는 필수입니다.")
        String uploadId,

        @NotBlank(message = "objectKey는 필수입니다.")
        String objectKey,

        @NotNull(message = "partNumber는 필수입니다.")
        Integer partNumber
){}