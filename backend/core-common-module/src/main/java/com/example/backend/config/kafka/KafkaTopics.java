package com.example.backend.config.kafka;

// [Kafka 토픽 저장]
public final class KafkaTopics {

    private KafkaTopics(){}

    // 1. Media Go워커 미디어 처리 토픽
    public static final String MEDIA_REQUEST_TOPIC = "media.video.requested";
    public static final String MEDIA_COMPLETED_TOPIC = "media.video.completed";

    // 2. Feed 팔로워 Redis 타임라인 저장 토픽
    public static final String FEED_POST_CREATED_TOPIC = "feed.post.created";
    public static final String FEED_POST_DELETED_TOPIC = "feed.post.deleted";

    // 3. post 모듈에서 minio로 실제 데이터 제거 토픽
    public static final String POST_MINIO_DELETE_TOPIC = "post.minio.deleted";

    // 4. Notification 실시간 SSE 친구 피드 알림 토픽
    public static final String NOTIFICATION_FEED_TOPIC = "notification.feed.created";

    // 5. 유저 프로필 변경(가입, 수정 탈퇴) 이벤트 토픽
    public static final String USER_ACCOUNT_UPDATED_TOPIC = "user.account.updated";

    // 6. post 모듈: 게시물 좋아요 토픽
    public static final String POST_LIKE_TOPIC = "post.like.toggled";

    // 7-1. 팔로우 추가(친구 추가) 시 팔로우 갯수 갱신을 위한 이벤트 토픽
    public static final String USER_FOLLOW_COUNT_UPDATED_TOPIC = "user.follow.count.updated";

    // 7-2. 게시물 추가 시 게시물 갯수 갱신을 위한 이벤트 토픽
    public static final String POST_COUNT_UPDATED_TOPIC = "post.count.updated";
}
