//로그인 완료 시 최종 응답
package com.example.backend.dto;

public record LoginResponse(
        String status,
        Data data
) {
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
