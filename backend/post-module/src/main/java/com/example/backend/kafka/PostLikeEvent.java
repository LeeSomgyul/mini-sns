package com.example.backend.kafka;

public record PostLikeEvent(
        Long postId,
        Long userId,
        boolean isLiked
) {
    public static PostLikeEvent of(Long postId, Long userId, boolean isLiked){
        return new PostLikeEvent(postId, userId, isLiked);
    }
}
