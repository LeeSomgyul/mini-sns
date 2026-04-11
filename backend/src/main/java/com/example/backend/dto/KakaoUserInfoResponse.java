package com.example.backend.dto;

import lombok.Builder;

//1단계 요청: KakaoTokenResponse -> 2단계 요청: KakaoUserInfoResponse
//1단계에서 받은 access_token을 들고 다시 카카오 서버에게 가서 사용자의 정보를 가져와 담아오는 바구니
@Builder
public record KakaoUserInfoResponse (
        Long id
){}
