package com.example.backend.dto.response;

import com.example.backend.entity.User;

public record TagUserProfileResponse(
        Long userId,
        String nickname,
        String name,
        String profileImageUrl
) {
    // profileImageBaseUrl: MiniO 기본 동일 주소
    public static TagUserProfileResponse from(User user, String profileImageBaseUrl){
        String finalImageUrl = null;

        if(user.getProfileImageUrl() != null){
            finalImageUrl = user.getProfileImageUrl().startsWith("http")
                    ? user.getProfileImageUrl()
                    : profileImageBaseUrl + user.getProfileImageUrl();
        }

        return new TagUserProfileResponse(
                user.getId(),
                user.getNickname(),
                user.getName(),
                finalImageUrl
        );
    }
}
