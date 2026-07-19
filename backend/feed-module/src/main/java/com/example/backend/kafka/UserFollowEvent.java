package com.example.backend.kafka;

// [팔로우 & 언팔로우 시 user모듈에게 전달받는 데이터]
public record UserFollowEvent(
        Long followerId, // 팔로우 하는 사람 (나)
        Long followeeId, // 팔로우 받는 사람 (상대방)
        String action // FOLLOW 또는 UNFOLLOW
) {
}
