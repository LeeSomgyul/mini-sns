package com.example.backend.kafka;

import com.example.backend.config.kafka.KafkaGroupId;
import com.example.backend.config.kafka.KafkaTopics;
import com.example.backend.service.UserCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserSoftDeleteConsumer {

    private final UserCacheService userCacheService;

    @KafkaListener(
            topics = KafkaTopics.USER_SOFT_DELETED_TOPIC,
            groupId = KafkaGroupId.GROUP_POST_USER_SOFT_DELETE,
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consume(UserSoftDeleteEvent event){
        log.info("[카프카 컨수머 수신] topics: {}", KafkaTopics.USER_SOFT_DELETED_TOPIC);

        try{
            userCacheService.softDeleteUserCache(event);
            log.info("[카프카 컨수머 처리 성공] topics: {}", KafkaTopics.USER_SOFT_DELETED_TOPIC);
        }catch(Exception e){
            log.info("[카프카 컨수머 처리 실패] topics: {}", KafkaTopics.USER_SOFT_DELETED_TOPIC, e);
        }
    }
}
