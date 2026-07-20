package com.example.backend.kafka;

// [사용자 셀럽으로 변경]
public record UserCelebrityChangedEvent(
        Long userId,
        boolean isCelebrity
) {
}
