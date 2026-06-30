package com.example.backend.kafka;

import com.example.backend.config.kafka.KafkaTopics;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PostDeletedPublisher{

    public final KafkaTemplate<String, Object> kafkaTemplate;

    // [전송 위치]
    // 1. feed 모듈에게 게시물 삭제 알림
    // 2. 프로필의 상태 갱신 (게시물 개수, 게시물 썸네일)
    public void publishPostDeleted(PostDeletedEvent event){
        String key = String.valueOf(event.postId());

        kafkaTemplate.send(KafkaTopics.POST_DELETED_TOPIC, key, event)
                .whenComplete((result, ex) -> {
                    if(ex == null){
                        log.info("[Kafka 메시지 발행 성공] Topic: {}, PostId: {}", KafkaTopics.POST_DELETED_TOPIC, event.postId());
                    }else{
                        log.error("[Kafka 메시지 발행 실패] Topic: {}", KafkaTopics.POST_DELETED_TOPIC, ex);
                    }
                });
    }
}
