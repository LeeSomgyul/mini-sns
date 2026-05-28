package com.example.backend.infrastructure.kafka.feed;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class FeedPushEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String REQUEST_TOPIC = "feed.post.created";

    public void publishPushEvent(FeedPushEvent event){
        String key = String.valueOf(event.authorId());

        kafkaTemplate.send(REQUEST_TOPIC, key, event)
                .whenComplete((result, ex) -> {
                    if(ex == null){
                        log.info("✅ Kafka 메시지 발행 성공 - Topic: {}, AuthorId: {}, PostId: {}", REQUEST_TOPIC, event.authorId(),event.postId());
                    }else{
                        log.error("❌ Kafka 메시지 발행 실패 - Topic: {}, AuthorId: {}, PostId: {}", REQUEST_TOPIC, event.authorId(),event.postId());
                    }
                });
    }
}
