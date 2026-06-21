package com.example.backend.kafka;

import com.example.backend.config.kafka.KafkaTopics;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PostHardDeletedPublisher {

    public final KafkaTemplate<String, Object> kafkaTemplate;

    // MiniO에게 미디어 url 삭제 요청을 전송하는 퍼블리셔
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
