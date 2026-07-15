package com.example.backend.dto.response;

import java.util.List;

// [팔로잉 및 팔로워 목록 조회]
public record FollowUserResponse(
        List<FollowContentDto> content,
        Long nextCursor,    // 다음 조회의 시작점
        boolean hasNextPage //다음페이지 존재 유무
) {
    public static FollowUserResponse of(List<FollowContentDto> content, Long nextCursor, boolean hasNextPage){
        return new FollowUserResponse(content, nextCursor, hasNextPage);
    }

    public record FollowContentDto(
            Long userId,
            String nickname,
            String name,
            String profileImageUrl
    ){
        public static FollowContentDto of(Long userId, String nickname, String name, String profileImageUrl){
            return new FollowContentDto(userId, nickname, name, profileImageUrl);
        }
    }
}

