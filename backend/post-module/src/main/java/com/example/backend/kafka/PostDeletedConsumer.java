package com.example.backend.kafka;

import com.example.backend.config.PostRedisKeyManager;
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
public class PostDeletedConsumer {

    public final StringRedisTemplate stringRedisTemplate;

    @KafkaListener(
            topics = KafkaTopics.POST_DELETED_TOPIC,
            groupId = KafkaGroupId.GROUP_POST_DELETE,
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consume(PostDeletedEvent event){
        String redisKey = PostRedisKeyManager.generateKey(PostRedisKeyManager.RedisKeyType.POST_COUNT, event.authorId());

        if(Boolean.TRUE.equals(stringRedisTemplate.hasKey(redisKey))){
            stringRedisTemplate.opsForValue().decrement(redisKey);
        }

        log.info("[카프카 컨수머 실행 완료] topics: {}", KafkaTopics.POST_DELETED_TOPIC);
    }

}
