package com.example.backend.dto.response;

import com.example.backend.entity.User;

public record UserTagResponse(
        Long userId,
        String nickname,
        String name,
        String profileImageUrl
) {
    public static UserTagResponse of(User user, String fullImageUrl){
        return new UserTagResponse(
                user.getId(),
                user.getNickname(),
                user.getName(),
                fullImageUrl
        );
    }
}
