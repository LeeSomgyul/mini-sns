package com.example.backend.dto;

import lombok.Builder;

@Builder
public record NicknameCheckResponse(
        String status,
        String message,
        Data data
) {
    @Builder
    public record Data(
        boolean exists
    ){}
}
