package com.example.backend.dto.file;

import lombok.Builder;

@Builder
public record SignPartResponse (
        String presignedUrl
){
    public static SignPartResponse of (String presignedUrl){
        return new SignPartResponse(presignedUrl);
    }
}
