//AccessToken과 RefreshToken을 모두 전달하는 DTO
package com.example.backend.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TokenResponse {
    private Long userId;
    private String nickname;
    private String accessToken;
    private String refreshToken;
}
