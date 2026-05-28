package com.example.backend.domain.post.dto.file;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CompleteRequest (
        @NotBlank(message = "uploadId는 필수입니다.")
        String uploadId,

        @NotBlank(message = "objectKey는 필수입니다.")
        String objectKey,

        @NotNull(message = "parts(조각 목록)는 필수입니다.")
        List<CompletedPart> parts
){
    public record CompletedPart(

            @JsonProperty("PartNumber")
            Integer partNumber,

            @JsonProperty("ETag")
            String eTag
    ){}
}