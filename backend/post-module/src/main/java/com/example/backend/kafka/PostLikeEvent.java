package com.example.backend.kafka;

public record PostLikeEvent(
        Long postId,
        Long userId,
        boolean isLiked // true: 게시물 좋아요, false: 게시물 좋아요 취소
) {
    public static PostLikeEvent of(Long postId, Long userId, boolean isLiked){
        return new PostLikeEvent(postId, userId, isLiked);
    }
}
