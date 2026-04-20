//회원가입 응답
package com.example.backend.dto;

import lombok.Builder;

@Builder
public record JoinResponse(
        Long userId,
        String email,
        String nickname
){}

/*
@Builder
public record JoinResponse (
    String status,
    String message,
    Data data
){
    @Builder
    public record Data(
            Long userId,
            String email,
            String nickname
    ){}
}
*/