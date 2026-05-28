//회원가입 응답
package com.example.backend.domain.auth.dto;

import com.example.backend.domain.user.entity.LocalAccount;
import com.example.backend.domain.user.entity.User;
import lombok.Builder;

@Builder
public record JoinResponse(
        Long userId,
        String email,
        String nickname
){
    public static JoinResponse of(User user, LocalAccount localAccount){
        return new JoinResponse(
            user.getId(),
            localAccount.getEmail(),
            user.getNickname()
        );
    }
}
