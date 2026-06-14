package com.example.backend.infrastructure.kafka.Media;

import com.example.backend.infrastructure.kafka.common.KafkaTopics;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class MediaEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    //GO 워커에 메시지 전송
    public void publishUploadComplete(MediaProcessEvent event){

        kafkaTemplate.send(KafkaTopics.MEDIA_REQUEST_TOPIC, event).whenComplete((result, ex) -> {
            if(ex == null){
                log.info("✅ Kafka 메시지 발행 성공 - Topic: {}, PostId: {}", KafkaTopics.MEDIA_REQUEST_TOPIC, event.postId());
            }else{
                log.error("❌ Kafka 메시지 발행 실패 - Topic: {}, PostId: {}", KafkaTopics.MEDIA_REQUEST_TOPIC, event.postId());
            }
        });
    }
}
