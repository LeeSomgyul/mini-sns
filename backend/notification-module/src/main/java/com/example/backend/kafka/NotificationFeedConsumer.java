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

        // 1. 알림 받을 대상 추출
        Long receiverId = event.receiverUserId();

        // 2. 카프카 메시지를 SSE 통해 전송
        notificationService.sendToClient(receiverId, event);
    }
}
