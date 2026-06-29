package com.example.backend.kafka;

import lombok.Builder;

// [게시물 추가 시, profile의 게시물 개수 업데이를 위한 이벤트]
@Builder
public record PostCountUpdatedEvent(
        Long userId,
        Long postId
) {
}
