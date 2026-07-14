package com.example.backend.dto.file;

public record ProfileSingPartResponse(
        String presignedUrl
) {
    public static ProfileSingPartResponse of(String presignedUrl){
        return new ProfileSingPartResponse(presignedUrl);
    }
}
