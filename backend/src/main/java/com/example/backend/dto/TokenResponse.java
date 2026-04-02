//AccessToken과 RefreshToken을 모두 전달하는 DTO
package com.example.backend.dto;

import lombok.Builder;

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
