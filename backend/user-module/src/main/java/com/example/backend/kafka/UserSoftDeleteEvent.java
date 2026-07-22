package com.example.backend.kafka;

import java.time.Instant;

public record UserSoftDeleteEvent(
        Long userId,
        Instant deletedAt
) {
    public static UserSoftDeleteEvent of(Long userId){
        return new UserSoftDeleteEvent(userId, Instant.now());
    }
}

