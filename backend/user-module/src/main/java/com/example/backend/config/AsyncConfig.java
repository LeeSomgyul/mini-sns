package com.example.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig {

    // [비동기 전용 스레드 풀 설정]
    // 목적: 유저 탈퇴 시 AuthAsyncService에서 for문이 실행될 때, 부하를 막기 위해 스레드를 별개로 분리하기 위함
    @Bean(name = "userCleanupExecutor")
    public Executor userCleanupExecutor(){
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);    // 기본 스레드 수
        executor.setMaxPoolSize(20);    // 최대 스레드 수
        executor.setQueueCapacity(500); // 대기 큐 크기
        executor.setThreadNamePrefix("UserCleanup-Async-");
        executor.initialize();
        return executor;
    }
}
