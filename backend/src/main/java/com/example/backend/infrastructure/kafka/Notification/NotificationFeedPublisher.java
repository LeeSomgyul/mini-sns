package com.example.backend.infrastructure.kafka.Notification;

import com.example.backend.infrastructure.kafka.common.KafkaTopics;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationFeedPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publish(NotificationFeedEvent event){
        // 1.한 유저(알림 받는 사람)당 1개의 파티션(통로)으로 메시지를 전달받음
        String key = String.valueOf(event.receiverUserId());

        // 2.카프카 event 메시지 발행
        // - kafkaTemplate.send(토픽, 키, 이벤트)
        kafkaTemplate.send(KafkaTopics.NOTIFICATION_FEED_TOPIC, key, event)
                .whenComplete((result, ex) -> {
                    if(ex == null){
                        log.info("✅ [Kafka 메시지 발행 성공] Topic: {}, Receiver: {}, TargetPost: {}",
                            KafkaTopics.NOTIFICATION_FEED_TOPIC,
                            event.receiverUserId(),
                            event.targerPostId()
                        );
                    }else{
                        log.error("❌ [Kafka 메시지 발행 실패] Topic: {}, Receiver: {}, TargetPost: {}, Reason: {}",
                            KafkaTopics.NOTIFICATION_FEED_TOPIC,
                            event.receiverUserId(),
                            event.targerPostId(),
                            ex.getMessage(),
                            ex
                        );
                    }
                });
    }
}
