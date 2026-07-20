package com.example.backend.dto.response;

public record UnfollowResponse(
        Long followerId,
        Long followingId,
        String status
) {
    public static UnfollowResponse of(Long followerId, Long followingId){
        return new UnfollowResponse(followerId, followingId, "UNFOLLOW");
    }
}
