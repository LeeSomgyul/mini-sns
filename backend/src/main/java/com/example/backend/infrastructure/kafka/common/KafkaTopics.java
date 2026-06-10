package com.example.backend.infrastructure.kafka.common;

// [Kafka 토픽 저장]
public final class KafkaTopics {

    private KafkaTopics(){}

    // 1.Media Go워커 미디어 처리 토픽
    public static final String MEDIA_REQUEST_TOPIC = "media.video.requested";
    public static final String MEDIA_COMPLETED_TOPIC = "media.video.completed";

    // 2.Feed 팔로워 Redis 타임라인 저장 토픽
    public static final String FEED_POST_TOPIC = "feed.post.created";
}
