package com.example.backend.dto.request;

import jakarta.validation.constraints.NotNull;

public record UnfollowRequest(
        @NotNull(message = "언팔로우할 대상의 ID는 필수입니다.")
        Long targetUserId
) {
}
