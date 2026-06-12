package com.example.backend.domain.notification.service;

import com.example.backend.domain.notification.repository.SseRepository;
import com.example.backend.domain.notification.service.connection.NotificationTargetConnection;
import com.example.backend.infrastructure.kafka.Notification.NotificationFeedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService{

    private final SseRepository sseRepository;
    private final SseEmitterFactory sseEmitterFactory;
    private final NotificationTargetConnection notificationTargetConnection;

    // SSE 연결 타임아웃 설정 (30분 간격으로 자동 연결 끊김)
    private static final Long DEFAULT_TIMEOUT = 30L * 60 * 1000;

    // 실시간 알림 이벤트 명
    private static final String EVENT_CONNECT = "CONNECT";
    private static final String EVENT_NEW_POST = "NEW_POST";


    // 1.실시간 연결 통로 개설
    // - 로그인을 마친 유저가 메인 피드 화면에 들어왔을 때 SSE 연결
    @Override
    public SseEmitter subscribe(Long userId) {
        // 1-1. 로그인한 사용자 정보 저장
        SseEmitter sseEmitter = sseEmitterFactory.create(DEFAULT_TIMEOUT);
        sseRepository.save(userId, sseEmitter);

        // 1-2. 메모리 누수 차단 장치(로그아웃, 타임아웃, 에러 상황)
        sseEmitter.onCompletion(() -> {
            log.info("SSE onCompletion 호출됨: userId={}", userId);
            sseRepository.deleteById(userId);
        });
        sseEmitter.onTimeout(() -> {
            log.info("SSE onTimeout 호출됨: userId={}", userId);
            sseRepository.deleteById(userId);
        });
        sseEmitter.onError((e) -> {
            log.error("SSE onError 발생: userId={}, error={}", userId, e.getMessage());
            sseRepository.deleteById(userId);
        });

        // 1-3. Kafka 더미 이벤트 메시지 발송
        // - userId: 데이터 전송 대상 사용자
        // - eventName: 연결 완료 메시지
        // - data: 더미 데이터
        try{
            sseEmitter.send(SseEmitter.event()
                    .id(UUID.randomUUID().toString())
                    .name(EVENT_CONNECT)
                    .data("SSE 연결 성공! [userId=" + userId + "]")
            );
        }catch(IOException e){
            sseRepository.deleteById(userId);
        }

        return sseEmitter;
    }

    // 2.새 게시물 작성 시 대상자들을 찾아 알림 넣기
    // - 카프카 consumer가 알림 들어오면 해당 메서드 실행
    @Override
    public void sendToClient(Long userId, NotificationFeedEvent event) {
        SseEmitter sseEmitter = sseRepository.get(userId);

        // 사용자가 연결이 된 경우 (로그인 하여 게시물로 들어와서 SSE 연결된 상태)
        if(sseEmitter != null){
            //본인은 '새요청' 알림 x
            try{
                // - userId: 데이터 전송 대상 사용자
                // - eventName: 전송할 이벤트 이름
                // - data: 실행 시 전달할 데이터
                sseEmitter.send(SseEmitter.event()
                        .id(UUID.randomUUID().toString())
                        .name(EVENT_NEW_POST)
                        .data(event.targerPostId())
                );

                log.info("[SSE 성공] 유저 {} 에게 새 글 알림 완료 (PostId: {})", userId, event.targerPostId());
            }catch(IOException e){
                // SSE 연결되어 있지만, 전송하는 순간 네트워크 끊김
                sseRepository.deleteById(userId);
                log.error("[SSE 실패] 연결 끊김으로 Emitter를 제거합니다. userId: {}", userId);
            }
        }
    }
}
