package com.example.backend.kafka;

import com.example.backend.config.kafka.KafkaTopics;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserSoftDeletePublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    // [회원탈퇴] 유저 소프트 삭제
    public void publish(UserSoftDeleteEvent event){
        String key = String.valueOf(event.userId());

        kafkaTemplate.send(KafkaTopics.USER_SOFT_DELETED_TOPIC, key, event)
                .whenComplete((result, ex) -> {
                    if(ex == null){
                        log.info("[Kafka 메시지 발행 성공] Topic: {}, UserId: {}",
                                KafkaTopics.USER_SOFT_DELETED_TOPIC, event.userId());
                    }else{
                        log.info("[Kafka 메시지 발행 실패] Topic: {}, UserId: {}, Error: {}",
                                KafkaTopics.USER_SOFT_DELETED_TOPIC, event.userId(), ex.getMessage());
                    }
                });
    }
}
