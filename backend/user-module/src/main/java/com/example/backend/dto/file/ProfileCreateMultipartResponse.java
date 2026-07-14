package com.example.backend.dto.file;

public record ProfileCreateMultipartResponse(
        String uploadId,
        String objectKey
) {
    public static ProfileCreateMultipartResponse of(String uploadId, String objectKey){
        return new ProfileCreateMultipartResponse(uploadId, objectKey);
    }
}
