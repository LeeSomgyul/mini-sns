package com.example.backend.dto;

import java.util.List;

public record PostUserProfileResponse(
        long postCount,
        List<ProfileThumbnailDto> thumbnails,
        boolean hasNextPage
) {
    public static PostUserProfileResponse of(long postCount, List<ProfileThumbnailDto> thumbnails, boolean hasNextPage){
        return new PostUserProfileResponse(postCount, thumbnails, hasNextPage);
    }

    public record ProfileThumbnailDto(
            Long postId,
            String thumbnailUrl
    ){
        public static ProfileThumbnailDto of(Long postId, String thumbnailUrl){
            return new ProfileThumbnailDto(postId, thumbnailUrl);
        }
    }
}
