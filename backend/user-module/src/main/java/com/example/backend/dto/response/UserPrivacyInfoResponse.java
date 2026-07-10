package com.example.backend.dto.response;

public record UserPrivacyInfoResponse(
        String name,
        String nickname,
        String phoneNumber,
        String profileImageUrl,
        String email,
        boolean isSocial
) {
    public static UserPrivacyInfoResponse of(
            String name,
            String nickname,
            String phoneNumber,
            String profileImageUrl,
            String email,
            boolean isSocial
    ){
        return new UserPrivacyInfoResponse(name, nickname, phoneNumber, profileImageUrl, email, isSocial);
    }
}
