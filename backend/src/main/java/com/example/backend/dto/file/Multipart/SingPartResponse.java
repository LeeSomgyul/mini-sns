package com.example.backend.dto.file.Multipart;

import lombok.Builder;

@Builder
public record SingPartResponse (
        String presignedUrl
){
    public static SingPartResponse of (String presignedUrl){
        return new SingPartResponse(presignedUrl);
    }
}
