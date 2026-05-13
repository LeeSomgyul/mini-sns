package com.example.backend.dto.file.Multipart;

import lombok.Builder;

@Builder
public record CompleteMultipartResponse (
        String location
){
    @Builder
    public static CompleteMultipartResponse of (String location){
        return new CompleteMultipartResponse(location);
    }
}
