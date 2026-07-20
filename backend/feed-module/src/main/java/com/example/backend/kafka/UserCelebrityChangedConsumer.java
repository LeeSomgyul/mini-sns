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
public class UserCelebrityChangedConsumer {

    private final StringRedisTemplate stringRedisTemplate;

    // 시스템 내에서 인플루언서 전체 명단 (userId)
    private static final String REDIS_CELEBRITY_KEY = "feed:celebrities";

    @KafkaListener(
            topics = KafkaTopics.USER_CELEBRITY_UPDATED_TOPIC,
            groupId = KafkaGroupId.GROUP_USER_CELEBRITY_UPDATE,
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consume (UserCelebrityChangedEvent event){
        String userId = String.valueOf(event.userId());
        boolean isCelebrity = event.isCelebrity();

        log.info("[카프카 컨수머 시작] Topic: {}, 유저 ID: {}, 셀럽 여부: {}", KafkaTopics.USER_CELEBRITY_UPDATED_TOPIC, userId, isCelebrity);

        if (isCelebrity) {
            // 인플루언서 레디스에서 userId 추가
            stringRedisTemplate.opsForSet().add(REDIS_CELEBRITY_KEY, userId);
            log.info("[카프카 컨수머 완료] {}에 인플루언서 {} 등록 완료", REDIS_CELEBRITY_KEY, userId);
        } else {
            // 인플루언서 레디스에서 userId 제거
            stringRedisTemplate.opsForSet().remove(REDIS_CELEBRITY_KEY, userId);
            log.info("[카프카 컨수머 완료] {}에서 유저 {} 제거 완료", REDIS_CELEBRITY_KEY, userId);
        }
    }
}
