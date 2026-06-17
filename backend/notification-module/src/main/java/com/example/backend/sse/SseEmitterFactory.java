package com.example.backend.sse;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

public interface SseEmitterFactory {
    SseEmitter create(Long timeout);
}
