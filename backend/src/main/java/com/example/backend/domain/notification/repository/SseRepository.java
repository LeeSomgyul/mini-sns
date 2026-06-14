package com.example.backend.domain.notification.repository;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

public interface SseRepository {
    // 1. 전체 서비스에서 현재 로그인한 사용자 누구 있는지 저장(한 userId 당 SeeEmitter 객체 1개)
    SseEmitter save(Long userId, SseEmitter sseEmitter);

    // 2. 전체 서비스에서 로그아웃 한 사용자 제거
    void deleteById(Long userId);

    // 3. userId 유저의 SseMitter 객체 가져오기
    SseEmitter get(Long userId);

    //🚨친구 기능 만들면 모든x 친구 기반으로 수정하기🚨
    // 4. 우리 서버에 연결되어있는 모든 SseEmitter 가져오기
    Map<Long, SseEmitter> findAll();
}
