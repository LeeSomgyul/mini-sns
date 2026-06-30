package com.example.backend.kafka;

import com.example.backend.config.kafka.KafkaTopics;import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PostCreatedPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publish(PostCreatedEvent event){
        String key = String.valueOf(event.authorId());

        kafkaTemplate.send(KafkaTopics.POST_CREATED_TOPIC, key, event)
                .whenComplete((result, ex) -> {
                    if(ex == null){
                        log.info("[Kafka 메시지 발행 성공] Topic: {}, AuthorId: {}, PostId: {}",
                                KafkaTopics.POST_CREATED_TOPIC, event.authorId(),event.postId());
                    }else{
                        log.error("[Kafka 메시지 발행 성공] Topic: {}, AuthorId: {}, PostId: {}",
                                KafkaTopics.POST_CREATED_TOPIC, event.authorId(),event.postId());
                    }
                });
    }
}
