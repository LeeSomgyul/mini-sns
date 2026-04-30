//AccessToken과 RefreshToken을 모두 전달하는 DTO
package com.example.backend.dto.user;

import com.example.backend.entity.User;
import lombok.Builder;

//인증 관련 백엔드에서 사용하는 응답 (service와 controller 사이)
@Builder
public record TokenResponse(
        Long userId,
        String nickname,
        String accessToken,
        String refreshToken
) {
    public static TokenResponse of(User user, String accessToken, String refreshToken){
        return new TokenResponse(
            user.getId(),
            user.getNickname(),
            accessToken,
            refreshToken
        );
    }
}

