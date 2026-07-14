package com.example.backend.dto.file;

public record ProfileCompleteResponse(
        String location
) {
    public static ProfileCompleteResponse of(String location){
        return new ProfileCompleteResponse(location);
    }
}
