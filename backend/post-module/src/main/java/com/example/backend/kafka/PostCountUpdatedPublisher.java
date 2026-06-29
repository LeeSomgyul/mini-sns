package com.example.backend.kafka;

import com.example.backend.config.kafka.KafkaTopics;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PostCountUpdatedPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    // [게시물 추가] profile에서 게시물 숫자 갱신을 위한 이벤트 발행
    public void publisher(PostCountUpdatedEvent event){
        String key = String.valueOf(event.userId());

        kafkaTemplate.send(KafkaTopics.POST_COUNT_UPDATED_TOPIC, key, event)
                .whenComplete((result, ex) -> {
                   if(ex == null){
                       log.info("[Kafka 메시지 발행 성공] Topic: {}, userId: {}, postId: {}",
                               KafkaTopics.POST_COUNT_UPDATED_TOPIC, event.userId(), event.postId());
                   }else{
                       log.info("[Kafka 메시지 발행 실패] Topic: {}, userId: {}, postId: {}, Error: {}",
                               KafkaTopics.POST_COUNT_UPDATED_TOPIC, event.userId(), event.postId(), ex.getMessage());
                   }
                });
    }
}
