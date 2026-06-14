package com.example.backend.domain.notification.service;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Component
public class SseEmitterFactoryImpl implements SseEmitterFactory{
    @Override
    public SseEmitter create(Long timeout) {
        return new SseEmitter(timeout);
    }
}
