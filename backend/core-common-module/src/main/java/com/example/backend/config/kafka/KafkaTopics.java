package com.example.backend.config.kafka;

// [Kafka 토픽 저장]
public final class KafkaTopics {

    private KafkaTopics(){}

    // 1. Media Go워커 미디어 처리 토픽
    public static final String MEDIA_REQUEST_TOPIC = "media.video.requested";
    public static final String MEDIA_COMPLETED_TOPIC = "media.video.completed";

    // 2. Feed 팔로워 Redis 타임라인 저장 토픽
    public static final String FEED_POST_TOPIC = "feed.post.created";

    // 3. Notification 실시간 SSE 친구 피드 알림 토픽
    public static final String NOTIFICATION_FEED_TOPIC = "notification.feed.created";

    // 4. 유저 프로필 변경(가입, 수정 탈퇴) 이벤트 토픽
    public static final String USER_ACCOUNT_UPDATED_TOPIC = "user.account.updated";

}
