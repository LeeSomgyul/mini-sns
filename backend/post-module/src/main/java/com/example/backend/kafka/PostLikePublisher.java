package com.example.backend.kafka;

import com.example.backend.config.kafka.KafkaTopics;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PostLikePublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publisher(PostLikeEvent event){

        String key = String.valueOf(event.postId());

        kafkaTemplate.send(KafkaTopics.POST_LIKE_TOPIC, key, event)
                .whenComplete((result, ex) -> {
                    if(ex == null){
                        log.info("[PostLike 이벤트] 카프카 메시지 발행 성공: Topic: {}, PostId: {}, UserId: {}",
                                KafkaTopics.FEED_POST_CREATED_TOPIC, event.postId(),event.userId());
                    }else{
                        log.error("[PostLike 이벤트] 카프카 메시지 발행 실패: Topic: {}, PostId: {}, UserId: {}",
                                KafkaTopics.FEED_POST_CREATED_TOPIC, event.postId(),event.userId());
                    }
                });
    }
}
