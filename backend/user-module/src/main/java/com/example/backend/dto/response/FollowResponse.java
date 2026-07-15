package com.example.backend.dto.response;

public record FollowResponse(
        Long followerId,
        Long followingId,
        String status
) {
    public static FollowResponse of(Long followerId, Long followingId, String status){
        return new FollowResponse(followerId, followingId, status);
    }
}
