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
public class FollowAndPostCountConsumer {

    private final StringRedisTemplate stringRedisTemplate;

    // [Redis Key]
    public enum RedisKeyType{
        POST_COUNT("user:%d:post_count"), //1. 각 사용자의 게시물 수 (예: user:{userId}:post_count)
        FOLLOWING_COUNT("user:%d:following_count"), //2. 각 사용자의 팔로잉(내가 팔로우하는 사람) 수 (예: user:{userId}:following_count)
        FOLLOWER_COUNT("user:%d:follower_count"); //3. 각 사용자의 팔로워(나를 팔로우하는 사람) 수 (예: user:{userId}:follower_count)

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
            topics = KafkaTopics.POST_COUNT_UPDATED_TOPIC,
            groupId = KafkaGroupId.GROUP_USER_PROFILE,
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumePostCountUpdated(PostCountUpdatedEvent event){
        String redisKey = generateKey(RedisKeyType.POST_COUNT, event.userId());

        // 숫자 +1
        stringRedisTemplate.opsForValue().increment(redisKey);
    }

    @KafkaListener(
            topics = KafkaTopics.USER_FOLLOW_COUNT_UPDATED_TOPIC,
            groupId = KafkaGroupId.GROUP_USER_PROFILE,
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeFollowCountUpdated(FollowCountUpdatedEvent event){
        String followingKey = generateKey(RedisKeyType.FOLLOWING_COUNT, event.followerId());
        String followerKey = generateKey(RedisKeyType.FOLLOWER_COUNT, event.followeeId());

        stringRedisTemplate.opsForValue().increment(followingKey);
        stringRedisTemplate.opsForValue().increment(followerKey);
    }
}
