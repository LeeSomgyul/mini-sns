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
public class UserFollowConsumer {

    private final StringRedisTemplate stringRedisTemplate;

    // [REDIS KEY]
    // 1. A라는 유저를 팔로우하는 일반 사람들 명단 (userId)
    private static final String REDIS_FOLLOWERS_KEY_PREFIX = "feed:followers:";
    // 2. A라는 유저가 팔로우하는 사람들 명단 (userId)
    private static final String REDIS_FOLLOWINGS_KEY_PREFIX = "feed:followings:";
    // 3. A라는 유저가 피드에서 보는 게시물 목록
    private static final String REDIS_FEED_KEY_PREFIX = "feed:timeline:";

    @KafkaListener(
            topics = KafkaTopics.USER_FOLLOW_COUNT_UPDATED_TOPIC,
            groupId = KafkaGroupId.GROUP_FEED_FOLLOW_UPDATE,
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumer(UserFollowEvent event){
        String followerId = String.valueOf(event.followerId()); // 팔로우 & 언팔로우 시도하는 사람 (나)
        String followeeId = String.valueOf(event.followeeId()); // 팔로우 & 언팔로우 당하는 사람 (상대방)
        String action = event.action(); // 팔로우 & 언팔로우

        log.info("[카프카 컨수머 실행] user 모듈에서 팔로우 & 언팔로우 시도 -> Follower: {}, Followee: {}, Action: {}", followerId, followeeId, action);

        String followersKey = REDIS_FOLLOWERS_KEY_PREFIX + followeeId;
        String followingsKey = REDIS_FOLLOWINGS_KEY_PREFIX + followerId;

        // 팔로우 & 언팔로우에 따른 분기 실행
        if("FOLLOW".equalsIgnoreCase(action)){
            stringRedisTemplate.opsForSet().add(followersKey, followerId);
            stringRedisTemplate.opsForSet().add(followingsKey, followeeId);
            log.info("[카프카 컨수머 완료] {} -> {} 추가 / {} -> {} 추가", followersKey, followerId, followingsKey, followeeId);
        }else if("UNFOLLOW".equalsIgnoreCase(action)){
            stringRedisTemplate.opsForSet().remove(followersKey, followerId);
            stringRedisTemplate.opsForSet().remove(followingsKey, followeeId);

            // 게시물 타임라인에서도 삭제
            String myTimeLineKey = REDIS_FEED_KEY_PREFIX + followerId;

            // 🚨 7/20까지 완료 (언팔로우 시 상대방 postid를 내 redis feed목록에서 제거)
            log.info("[카프카 컨수머 완료] {} -> {} 제거 / {} -> {} 제거", followersKey, followerId, followingsKey, followeeId);
        }
    }
}
