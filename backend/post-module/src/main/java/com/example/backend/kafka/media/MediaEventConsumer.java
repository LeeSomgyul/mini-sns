package com.example.backend.kafka.media;


import com.example.backend.config.kafka.KafkaGroupId;
import com.example.backend.config.kafka.KafkaTopics;
import com.example.backend.dto.file.GoWorkerResultResponse;
import com.example.backend.service.MediaEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class MediaEventConsumer {

    private final MediaEventService mediaEventService;

    //[Go워커 -> 자바 메시지 수신 및 DB 변경]
    @KafkaListener(
            topics = KafkaTopics.MEDIA_COMPLETED_TOPIC,
            groupId = KafkaGroupId.GROUP_POST_MEDIA_COMPLETED,
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void postMediaDBChange(GoWorkerResultResponse response){
        log.info("[Go 워커로부터 인코딩 결과 수신 완료] PostID={}", response.postId());
        mediaEventService.processMediaResult(response);
    }
}
