package com.example.backend.dto;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {
    private String status;
    private Data data;

    @Getter
    @Builder
    public static class Data{
        private Long userId;
        private String nickname;
        private String accessToken;
        private int expiresIn;
    }
}
