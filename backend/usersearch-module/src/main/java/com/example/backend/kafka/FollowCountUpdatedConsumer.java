package com.example.backend.kafka;

import com.example.backend.config.kafka.KafkaGroupId;
import com.example.backend.config.kafka.KafkaTopics;
import com.example.backend.service.UserFollowCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class FollowCountUpdatedConsumer {

    private final UserFollowCacheService userFollowCacheService;

    @KafkaListener(
            topics = KafkaTopics.USER_FOLLOW_COUNT_UPDATED_TOPIC,
            groupId = KafkaGroupId.GROUP_USERSEARCH_FOLLOW_UPDATE,
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consume(FollowCountUpdatedEvent event){
        log.info("[카프카 컨수머 수신] topics: {}", KafkaTopics.USER_FOLLOW_COUNT_UPDATED_TOPIC);

        try{
            userFollowCacheService.updateCache(event);
            log.error("[카프카 컨수머 처리 성공] topics: {}, followerId: {}, followeeId: {}",
                    KafkaTopics.USER_FOLLOW_COUNT_UPDATED_TOPIC, event.followerId(), event.followeeId());
        }catch (Exception e){
            log.error("[카프카 컨수머 처리 실패] topics: {}, followerId: {}, followeeId: {}",
                    KafkaTopics.USER_FOLLOW_COUNT_UPDATED_TOPIC, event.followerId(), event.followeeId(), e);
        }
    }
}
