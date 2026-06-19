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

    // feed 모듈에게 전송하는 소프트 삭제 퍼블리셔
    public void publishPostDeleted(PostDeletedEvent event){
        String key = String.valueOf(event.postId());

        kafkaTemplate.send(KafkaTopics.FEED_POST_DELETED_TOPIC, key, event)
                .whenComplete((result, ex) -> {
                    if(ex == null){
                        log.info("[Kafka 메시지 발행] feed 모듈로 메시지 전송 성공: Topic: {}, PostId: {}", KafkaTopics.FEED_POST_DELETED_TOPIC, event.postId());
                    }else{
                        log.error("[Kafka 메시지 발행] feed 모듈로 메시지 전송 실패: Topic: {}", KafkaTopics.FEED_POST_DELETED_TOPIC, ex);
                    }
                });
    }

    // MiniO에게 전송하는 실제 하드 삭제 퍼블리셔
    public void publishPostHardDeleted(PostHardDeletedEvent event){
        String key = String.valueOf(event.postId());

        kafkaTemplate.send(KafkaTopics.POST_MINIO_DELETE_TOPIC, key, event)
                .whenComplete((result, ex) -> {
                    if(ex == null){
                        log.info("[Kafka 메시지 발행] minio로 삭제 메시지 전송 성공: Topic: {}", KafkaTopics.POST_MINIO_DELETE_TOPIC);
                    }else{
                        log.error("[Kafka 메시지 발행] minio로 삭제 메시지 전송 실패: Topic: {}", KafkaTopics.POST_MINIO_DELETE_TOPIC, ex);
                    }
                });
    }
}
