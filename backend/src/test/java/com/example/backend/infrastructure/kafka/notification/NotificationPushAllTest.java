package com.example.backend.infrastructure.kafka.notification;

import com.example.backend.domain.notification.repository.SseRepository;
import com.example.backend.domain.notification.service.NotificationService;
import com.example.backend.infrastructure.kafka.Notification.NotificationFeedEvent;
import com.example.backend.infrastructure.kafka.Notification.NotificationFeedPublisher;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDateTime;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.spy;

@SpringBootTest
@DirtiesContext //테스트 후 톰캣 잔재 제거
@EmbeddedKafka(
        partitions = 1,
        topics = {"notification.feed.created"}
)
class NotificationPushAllTest {

    @Autowired private NotificationService notificationService;
    @Autowired private NotificationFeedPublisher notificationFeedPublisher;
    @Autowired private SseRepository sseRepository;

    @Test
    @DisplayName("게시물 작성되어 카프카 이벤트가 발행되면, 컨슈머가 이를 수신하여 대기 중인 유저에게 SSE로 알림을 전송해야 한다")
    void kafkaSseIntegrationTest() throws Exception{
        // [1] GIVEN
        Long userId = 1L;
        CountDownLatch latch = new CountDownLatch(1);

        // 1-1. 로그인을 마친 유저가 메인 피드 화면에 들어왔을 때 SSE 연결
        SseEmitter sseEmitter = notificationService.subscribe(userId);

        // 1-2. publisher ~ consumer ~ 유저가 .send() 받음 전 과정을 감시하는 객체 생성
        // Kafka는 비동기로 처리되기 때문에, event를 발행해도 잘 가는지 지켜보는게 아니라 다음 일을 하러 간다.
        // 때문에 테스트에서는 스레드 하나에 감시 역할을 붙여서 지켜보도록 지정해야한다.(=Spy 객체)
        SseEmitter spyEmitter = spy(sseEmitter);
        // .send()가 실행 되는지 확인하기 위해 레포지토리에 스파이 심어두기
        sseRepository.save(userId, spyEmitter);

        // consumer가 스파이를 꺼내서 .send()가 실행되는지 순간 포착
        doAnswer(invocation -> {
            Object result = invocation.callRealMethod();
            latch.countDown();
            return result;
        }).when(spyEmitter).send(any(SseEmitter.SseEventBuilder.class));

        // 가상 카프카 이벤트 생성
        NotificationFeedEvent event = new NotificationFeedEvent(
                "NEW_POST",
                userId,
                999L,
                100L,
                LocalDateTime.now()
        );

        // [2] WHEN
        // 카프카 이벤트 메시지 발송
        notificationFeedPublisher.publish(event);

        // [3] THEN
        // 3-1.spyEmitter.send() 실행할 때까지 5초 기다림 (비동기라서)
        boolean messageReceived = latch.await(5, TimeUnit.SECONDS);

        // 3-2.최종 확인
        assertThat(messageReceived)
                .as("카프카 이벤트가 정상적으로 consume되어 SSE 발송 로직까지 도달해야 합니다.")
                .isTrue();
    }
}
