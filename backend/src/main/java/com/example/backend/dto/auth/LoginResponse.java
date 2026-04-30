package com.example.backend.dto.auth;

import com.example.backend.dto.user.TokenResponse;
import lombok.Builder;

//로그인(일반, 카카오) 시 최종 결과를 프론트로 전달하는 응답
@Builder
public record LoginResponse(
        Long userId,
        String nickname,
        String accessToken,
        int expiresIn
) {
    public static LoginResponse from (TokenResponse tokenResponse){
        return new LoginResponse(
                tokenResponse.userId(),
                tokenResponse.nickname(),
                tokenResponse.accessToken(),
                1800
        );
    }
}

