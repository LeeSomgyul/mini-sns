package com.example.backend.kafka;

import java.time.LocalDateTime;

public record FeedPostDeletedEvent(
        Long postId,
        Long authorId,
        LocalDateTime createdAt
) {
    public static FeedPostDeletedEvent of (Long postId, Long authorId){
        return new FeedPostDeletedEvent(postId, authorId, LocalDateTime.now());
    }
}
