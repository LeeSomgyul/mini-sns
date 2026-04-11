package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;

//카카오가 url에 포함해서 넘겨주는 code를 백엔드로 가져오는 요청
public record KakaoLoginRequest (
        @NotBlank(message = "잘못된 접근입니다. (인가 코드 누락)")
        String authorizationCode,//카카오에 로그인 요청하면 url에 같이 넘겨주는 code
        String deviceToken
){}
