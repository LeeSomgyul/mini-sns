package com.example.backend.kafka;

// [팔로우 발생 시, 팔로우 수 업데이트를 위한 이벤트]
public record FollowCountUpdatedEvent(
        Long followerId, // 팔로우 하는 사람 (나)
        Long followeeId // 팔로우 받는 사람 (상대방)
) {
}
