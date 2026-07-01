package com.example.backend.dto.response;

import com.example.backend.entity.User;

public record UserProfileResponse(
        Long userId,
        String nickname,
        String name,
        String profileImageUrl,
        long followerCount,
        long followingCount,
        Boolean isFollowing,
        boolean isMe,
        long mutualFollowerCount, // 나와 함께 아는 친구의 총 인원 수
        String representativeMutualNickname // 대표 친구 1명 닉네임 (없으면 null)
) {
    public static UserProfileResponse from (
        User user,
        long followerCount,
        long followingCount,
        Boolean isFollowing,
        boolean isMe,
        long mutualFollowerCount,
        String representativeMutualNickname
    ){
        return new UserProfileResponse(
                user.getId(),
                user.getNickname(),
                user.getName(),
                user.getProfileImageUrl(),
                followerCount,
                followingCount,
                isFollowing,
                isMe,
                mutualFollowerCount,
                representativeMutualNickname
        );
    }
}
