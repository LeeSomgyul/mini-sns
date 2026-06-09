package com.example.backend.domain.notification.service;

import com.example.backend.domain.notification.repository.SseRepository;
import com.example.backend.domain.notification.service.connection.NotificationTargetConnection;
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
    private final NotificationTargetConnection notificationTargetConnection;

    // SSE 연결 타임아웃 설정 (30분 간격으로 자동 연결 끊김)
    private static final Long DEFAULT_TIMEOUT = 30L * 60 * 1000;

    // 실시간 알림 이벤트 명
    private static final String EVENT_CONNECT = "connect";
    private static final String EVENT_NEW_POST = "newPost";


    // 1.실시간 연결 통로 개설
    // - 로그인을 마친 유저가 메인 피드 화면에 들어왔을 때 SSE 연결
    @Override
    public SseEmitter subscribe(Long userId) {
        // 1-1. 로그인한 사용자 정보 저장
        SseEmitter sseEmitter = new SseEmitter(DEFAULT_TIMEOUT);
        sseRepository.save(userId, sseEmitter);

        // 1-2. 메모리 누수 차단 장치(로그아웃, 타임아웃, 에러 상황)
        sseEmitter.onCompletion(() -> sseRepository.deleteById(userId));
        sseEmitter.onTimeout(() -> sseRepository.deleteById(userId));
        sseEmitter.onError((e) -> sseRepository.deleteById(userId));

        // 1-3. 더미 데이터 발송
        // - userId: 데이터 전송 대상 사용자
        // - eventName: 연결 완료 메시지
        // - data: 더미 데이터
        sendToClient(userId, EVENT_CONNECT, "SSE 연결 완료! [userId=" + userId + "]");

        return sseEmitter;
    }

    // 2.새 게시물 작성 시 대상자들을 찾아 알림 넣기
    // - 카프카 리스너가 알림 들어오면 해당 메서드 실행
    @Override
    public void broadcastNewPostEvent(Long actorId, Object data) {
        // 2-1. 알림 대상자 id 목록 추출 (🚨현재는 전체 사용자, 나중엔 친구 목록🚨)
        List<Long> targetUserIds = notificationTargetConnection.findTargetUserIds(actorId);

        // 2-2. 연결되어있는 SSE 중 대상자들에게만 실시간 알림 전송
        // - userId: 데이터 전송 대상 사용자
        // - eventName: 새로운 게시물 알림 메시지
        // - data: postId
        for(Long targetUserId : targetUserIds){
            sendToClient(targetUserId, EVENT_NEW_POST, data);
        }
    }

    // [보조 메서드] 프론트로 데이터 전송
    // - userId: 데이터 전송 대상 사용자
    // - eventName: 전송할 이벤트 이름
    // - data: 실행 시 전달할 데이터
    private void sendToClient(Long userId, String eventName, Object data){
        SseEmitter sseEmitter = sseRepository.get(userId);

        if(sseEmitter != null){
            try{
                sseEmitter.send(SseEmitter.event()
                        .id(UUID.randomUUID().toString())
                        .name(eventName)
                        .data(data));
            }catch(IOException e){
                // 사용자 연결이 종료된 경우 (로그아웃, 타임아웃, 에러 등)
                sseRepository.deleteById(userId);
                log.error("SSE 전송 실패로 연결을 강제 제거합니다. userId: {}", userId);
            }
        }
    }
}
