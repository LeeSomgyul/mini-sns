package com.example.backend.kafka;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record UserUpdatedEvent(
        Long userId,
        String nickname,
        String profileImageUrl,
        String status
) {
}
