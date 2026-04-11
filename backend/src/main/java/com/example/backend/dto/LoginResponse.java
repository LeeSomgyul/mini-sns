package com.example.backend.dto;

import lombok.Builder;

//로그인(일반, 카카오) 시 최종 결과를 프론트로 전달하는 응답
@Builder
public record LoginResponse(
        String status,
        Data data
) {
    @Builder
    public record Data(
            Long userId,
            String nickname,
            String accessToken,
            int expiresIn
    ){}
}

/*
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    private String status;
    private Data data;

    @Getter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Data{
        private Long userId;
        private String nickname;
        private String accessToken;
        private int expiresIn;
    }
}
*/
