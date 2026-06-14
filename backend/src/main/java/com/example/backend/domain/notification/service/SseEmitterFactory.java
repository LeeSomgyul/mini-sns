package com.example.backend.domain.notification.service;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

public interface SseEmitterFactory {
    SseEmitter create(Long timeout);
}
