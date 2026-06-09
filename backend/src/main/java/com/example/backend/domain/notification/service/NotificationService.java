package com.example.backend.domain.notification.service;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

// [서버 증설로 인해 Redis로 바꿀 때를 대비하여 인터페이스 구현]
public interface NotificationService {

    // 1.실시간 연결 통로 개설
    // - 로그인을 마친 유저가 메인 피드 화면에 들어왔을 때 SSE 연결
    SseEmitter subscribe(Long userId);

    // 2.새 게시물 작성 시 대상자들을 찾아 알림 넣기
    // - 카프카 리스너가 알림 들어오면 해당 메서드 실행
    void broadcastNewPostEvent(Long actorId, Object data);
}
