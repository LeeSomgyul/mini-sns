package com.example.backend.infrastructure.kafka.publisher;

import com.example.backend.infrastructure.kafka.event.MediaProcessEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class MediaEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String REQUEST_TOPIC = "media.video.requested";// 자바 -> Go워커

    //GO 워커에 메시지 전송
    public void publishUploadComplete(MediaProcessEvent event){

        kafkaTemplate.send(REQUEST_TOPIC, event).whenComplete((result, ex) -> {
            if(ex == null){
                log.info("✅ Kafka 메시지 발행 성공 - Topic: {}, PostId: {}", REQUEST_TOPIC, event.postId());
            }else{
                log.error("❌ Kafka 메시지 발행 실패 - PostId: {}", event.postId());
            }
        });
    }
}
