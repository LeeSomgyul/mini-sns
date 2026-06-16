package com.example.backend.config.kafka;

public record UserUpdatedEvent(
        Long userId,
        String nickname,
        String profileImageUrl,
        String status
) {
}
