package com.example.backend.domain.post.dto.file;

import lombok.Builder;

@Builder
public record CreateMultipartResponse (
        String uploadId,
        String objectKey
){
    public static CreateMultipartResponse of (String uploadId, String objectKey){
        return new CreateMultipartResponse(uploadId, objectKey);
    }
}