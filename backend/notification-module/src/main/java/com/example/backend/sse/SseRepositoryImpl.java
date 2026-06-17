package com.example.backend.sse;

import org.springframework.stereotype.Repository;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class SseRepositoryImpl implements SseRepository{

    // [ConcurrentHashMap에 key, value 저장]
    // key: 전체 서비스에서 로그인한 사용자
    // Value: 실시간 신호를 보낼 수 있는 SseEmitter 객체
    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    @Override
    public SseEmitter save(Long userId, SseEmitter emitter) {
        emitters.put(userId, emitter);
        return emitter;
    }

    @Override
    public void deleteById(Long userId) {
        emitters.remove(userId);
    }

    @Override
    public SseEmitter get(Long userId) {
        return emitters.get(userId);
    }

    @Override
    public Map<Long, SseEmitter> findAll() {
        return emitters;
    }
}
