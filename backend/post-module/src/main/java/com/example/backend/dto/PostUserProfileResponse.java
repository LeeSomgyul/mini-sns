package com.example.backend.dto;

import java.util.List;

public record PostUserProfileResponse(
        long postCount,
        List<String> thumbnails
) {
    public static PostUserProfileResponse of(long postCount, List<String> thumbnails){
        return new PostUserProfileResponse(postCount, thumbnails);
    }
}
