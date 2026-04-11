//AccessToken과 RefreshToken을 모두 전달하는 DTO
package com.example.backend.dto;

import lombok.Builder;

//인증 관련 백엔드에서 사용하는 응답 (service와 controller 사이)
@Builder
public record TokenResponse(
        Long userId,
        String nickname,
        String accessToken,
        String refreshToken
) {
}

/*
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TokenResponse {
    private Long userId;
    private String nickname;
    private String accessToken;
}*/
