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
    private static final String TOPIC = "media.video.process";//메시지 저장될 경로

    //[메서드] 미디어 업로드 완료 이벤트(메시지)를 카프카로 생성
    public void publishUploadComplete(MediaProcessEvent event){
        kafkaTemplate.send(TOPIC, event).whenComplete((result, ex) -> {
            if(ex == null){
                log.info("✅ Kafka 메시지 발행 성공 - Topic: {}, PostId: {}", TOPIC, event.postId());
            }else{
                log.error("❌ Kafka 메시지 발행 실패 - PostId: {}", event.postId());
            }
        });
    }
}
