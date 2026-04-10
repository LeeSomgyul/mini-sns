package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record KakaoLoginRequest (
        @NotBlank(message = "잘못된 접근입니다. (인가 코드 누락)")
        String authorizationCode,
        String deviceToken
){}
