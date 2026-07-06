package com.example.backend.kafka;

import com.example.backend.config.kafka.KafkaTopics;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class FollowCountUpdatedPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    // [팔로우 추가] profile에서 팔로우 수 갱신을 위한 이벤트 발행
    public void publish(FollowCountUpdatedEvent event){
        String key = String.valueOf(event.followerId());

        kafkaTemplate.send(KafkaTopics.USER_FOLLOW_COUNT_UPDATED_TOPIC, key, event)
                .whenComplete((result, ex) -> {
                    if(ex == null){
                        log.info("[Kafka 메시지 발행 성공] Topic: {}, FollowerId: {}, FolloweeId: {}",
                                KafkaTopics.USER_FOLLOW_COUNT_UPDATED_TOPIC, event.followerId(), event.followeeId());
                    }else{
                        log.info("[Kafka 메시지 발행 실패] Topic: {}, FollowerId: {}, FolloweeId: {}, Error: {}",
                                KafkaTopics.USER_FOLLOW_COUNT_UPDATED_TOPIC, event.followerId(), event.followeeId(), ex.getMessage());
                    }
                });
    }
}
