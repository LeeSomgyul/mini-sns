package com.example.backend.kafka;

import java.time.LocalDateTime;

public record PostDeletedEvent(
        Long postId,
        Long authorId,
        LocalDateTime createdAt
) {
    public static PostDeletedEvent of (Long postId, Long authorId){
        return new PostDeletedEvent(postId, authorId, LocalDateTime.now());
    }
}
