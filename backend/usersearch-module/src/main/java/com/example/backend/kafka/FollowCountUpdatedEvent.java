package com.example.backend.kafka;

import java.time.Instant;
import java.time.LocalDateTime;

// [팔로우 & 언팔로우] userFollowCache 업데이트
public record FollowCountUpdatedEvent(
        Long followerId, // 팔로우 하는 사람 (나)
        Long followeeId, // 팔로우 받는 사람 (상대방)
        String action, // FOLLOW 또는 UNFOLLOW
        Instant created_at
) {
    public static FollowCountUpdatedEvent of(Long followerId, Long followeeId, String action){
        return new FollowCountUpdatedEvent(followerId, followeeId, action, Instant.now());
    }
}
