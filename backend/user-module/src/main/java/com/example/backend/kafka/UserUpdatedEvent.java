package com.example.backend.kafka;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record UserUpdatedEvent(
        Long userId,
        String name,
        String nickname,
        String profileImageUrl,
        String status
) {
}
