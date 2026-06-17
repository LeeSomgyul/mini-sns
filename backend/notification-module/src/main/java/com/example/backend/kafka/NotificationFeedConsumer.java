package com.example.backend.kafka;

import com.example.backend.config.kafka.KafkaTopics;
import com.example.backend.service.NotificationService;
import com.example.backend.sse.SseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationFeedConsumer {

    private final SseRepository sseRepository;
    private final NotificationService notificationService;

    @KafkaListener(
        topics = KafkaTopics.NOTIFICATION_FEED_TOPIC,
        groupId = "mini-sns-notification-feed-#{T(java.util.UUID).randomUUID().toString()}"
    )
    public void comsume(NotificationFeedEvent event){

        Long authorId = event.triggerUserId();

        // 내 서버 메모리(SseRepository)에 연결되어 살아있는 모든 유저에게 "새 글 떴다!" 하고 신호를 보냄
        sseRepository.findAll().forEach((userId, emitter) -> {
            if(!userId.equals(authorId)){
                notificationService.sendToClient(userId, event);
            }
        });
    }
}
