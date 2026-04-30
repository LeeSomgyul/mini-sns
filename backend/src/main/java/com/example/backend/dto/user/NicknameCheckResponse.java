package com.example.backend.dto.user;

import lombok.Builder;

@Builder
public record NicknameCheckResponse(
        boolean exists
){
    public static NicknameCheckResponse from (boolean exists){
        return new NicknameCheckResponse(
                exists
        );
    }
}

