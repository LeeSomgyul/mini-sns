package com.example.backend.kafka;

import com.example.backend.config.kafka.KafkaTopics;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserCelebrityChangedPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    // [인플루언서로 변경] 유저 일반 사용자 -> 인플루언서 변경
    public void publish(UserCelebrityChangedEvent event){
        String key = String.valueOf(event.userId());

        kafkaTemplate.send(KafkaTopics.USER_CELEBRITY_UPDATED_TOPIC, key, event)
                .whenComplete((result, ex) -> {
                    if (ex == null) {
                        log.info("[Kafka 메시지 발행 성공] Topic: {}, 유저: {}, 셀럽여부: {}",
                                KafkaTopics.USER_CELEBRITY_UPDATED_TOPIC, event.userId(), event.isCelebrity());
                    } else {
                        log.error("[Kafka 메시지 발행 실패] Topic: {}, 유저: {}, 에러: {}",
                                KafkaTopics.USER_CELEBRITY_UPDATED_TOPIC, event.userId(), ex.getMessage());
                    }
                });
    }
}
