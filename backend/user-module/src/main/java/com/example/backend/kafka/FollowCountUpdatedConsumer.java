package com.example.backend.kafka;

import com.example.backend.config.kafka.KafkaGroupId;
import com.example.backend.config.kafka.KafkaTopics;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class FollowCountUpdatedConsumer {

    private final StringRedisTemplate stringRedisTemplate;

    // [Redis Key]
    public enum RedisKeyType{
        FOLLOWING_COUNT("user:%d:following_count"), // 각 사용자의 팔로잉(내가 팔로우하는 사람) 수 (예: user:{userId}:following_count)
        FOLLOWER_COUNT("user:%d:follower_count"),   // 각 사용자의 팔로워(나를 팔로우하는 사람) 수 (예: user:{userId}:follower_count)
        FOLLOWING_SET("user:%d:following_set"),     // 내가 팔로우하는 사람들의 ID 모음
        FOLLOWER_SET("user:%d:follower_set");       // 나를 팔로우하는 사람들의 ID 모음

        private final String format;
        RedisKeyType(String format) {
            this.format = format;
        }
    }

    // [공통 Redis Key 생성 메서드]
    public static String generateKey(RedisKeyType type, Long userId){
        return String.format(type.format, userId);
    }

    @KafkaListener(
            topics = KafkaTopics.USER_FOLLOW_COUNT_UPDATED_TOPIC,
            groupId = KafkaGroupId.GROUP_USER_PROFILE,
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consume(FollowCountUpdatedEvent event){
        Long followerId = event.followerId(); // 팔로우를 한 사람 (나)
        Long followeeId = event.followeeId(); // 팔로우를 받은 사람 (상대방)

        String followingCountKey = generateKey(RedisKeyType.FOLLOWING_COUNT, followerId);
        String followerCountKey = generateKey(RedisKeyType.FOLLOWER_COUNT, followeeId);
        String followingSetKey = generateKey(RedisKeyType.FOLLOWING_SET, followerId);
        String followerSetKey = generateKey(RedisKeyType.FOLLOWER_SET, followeeId);

        //🚨친구 삭제(언팔로우) 기능 구현 후 count 감소 및 set 제거 구현하기🚨
        stringRedisTemplate.opsForValue().increment(followingCountKey);
        stringRedisTemplate.opsForValue().increment(followerCountKey);
        stringRedisTemplate.opsForSet().add(followingSetKey, String.valueOf(followeeId));
        stringRedisTemplate.opsForSet().add(followerSetKey, String.valueOf(followerId));

        log.info("[카프카 컨수머 실행 완료] topics: {} / Redis follower: [{}] -> followee: [{}]", KafkaTopics.USER_FOLLOW_COUNT_UPDATED_TOPIC, followerId, followeeId);
    }
}
