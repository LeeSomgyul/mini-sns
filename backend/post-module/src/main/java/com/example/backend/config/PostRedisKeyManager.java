package com.example.backend.config;

import com.example.backend.kafka.PostCreatedConsumer;

public class PostRedisKeyManager {

    public enum RedisKeyType{
        // 1. 유저별 프로필 게시글 수
        POST_COUNT("user:%d:post_count"),
        // 2. 분산 락 전용 키
        LOCK_POST_COUNT("lock:user:%d:post_count");

        private final String format;

        RedisKeyType(String format) { this.format = format; }
    }

    // [공통 Redis Key 생성 메서드]
    public static String generateKey(RedisKeyType type, Object... args){
        return String.format(type.format, args);
    }
}
