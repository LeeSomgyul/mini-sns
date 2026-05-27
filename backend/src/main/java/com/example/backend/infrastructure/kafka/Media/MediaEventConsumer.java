package com.example.backend.infrastructure.kafka.Media;

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
            topics = "media.video.completed",
            groupId = "mini-sns-media-backend",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void postMediaDBChange(GoWorkerResultResponse response){
        log.info("📥 Go 워커로부터 인코딩 결과 수신 완료: PostID={}", response.postId());
        mediaEventService.processMediaResult(response);
    }
}
