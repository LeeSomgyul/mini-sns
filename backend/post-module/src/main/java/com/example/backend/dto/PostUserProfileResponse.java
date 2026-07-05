package com.example.backend.dto;

import java.util.List;

public record PostUserProfileResponse(
        long postCount,
        List<String> thumbnails,
        boolean hasNextPage
) {
    public static PostUserProfileResponse of(long postCount, List<String> thumbnails, boolean hasNextPage){
        return new PostUserProfileResponse(postCount, thumbnails, hasNextPage);
    }
}
