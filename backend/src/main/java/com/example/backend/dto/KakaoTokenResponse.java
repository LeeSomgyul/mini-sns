package com.example.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

//1단계 요청: KakaoTokenResponse -> 2단계 요청: KakaoUserInfoResponse
//카카오 서버가 우리 서버에게 전달해주는 응답 받는 바구니
@Builder
public record KakaoTokenResponse (
    @JsonProperty("access_token")
    String accessToken//카카오에서 우리에게 주는 토큰(우리가 프론트에게 주는 토큰과 다른 토큰임)
){}
