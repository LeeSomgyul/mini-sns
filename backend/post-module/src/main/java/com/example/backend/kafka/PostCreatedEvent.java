package com.example.backend.kafka;

import java.time.LocalDateTime;

public record PostCreatedEvent(
        Long postId,
        Long authorId,
        LocalDateTime createdAt
) {
    public static PostCreatedEvent of(Long postId, Long authorId){
        return new PostCreatedEvent(postId, authorId, LocalDateTime.now());
    }
}
