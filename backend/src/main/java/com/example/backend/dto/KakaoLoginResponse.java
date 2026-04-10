package com.example.backend.dto;

import lombok.Builder;

@Builder
public record KakaoLoginResponse (
        String status,
        Data data
){
    @Builder
    public record Data(
            Long userId,
            String nickname,
            String accessToken,
            int expiresIn,
            boolean isNewUser
    ){}
}
