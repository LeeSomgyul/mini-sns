package com.example.backend.kafka;

import java.time.LocalDateTime;

public record FeedPostCreatedEvent(
        Long postId,
        Long authorId,
        LocalDateTime createdAt
) {
    public static FeedPostCreatedEvent of(Long postId, Long authorId){
        return new FeedPostCreatedEvent(postId, authorId, LocalDateTime.now());
    }
}
