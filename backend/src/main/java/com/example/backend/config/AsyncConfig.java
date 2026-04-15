package com.example.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

//비동기처리 사용하기 위한 설정
@Configuration
@EnableAsync
public class AsyncConfig {

    //ffmpeg에서 비동기 사용하기 위한 설정
    @Bean(name = "ffmpegTaskExecutor")
    public Executor ffmpegTaskExecutor(){
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(3);//기본적으로 대기하는 스레드 수
        executor.setMaxPoolSize(10);//최대 스레드 수(동시에 10개 동영상 처리 가능)
        executor.setQueueCapacity(50);//10개가 다 차면 대기열에 50개까지 줄 세우기 가능
        executor.setThreadNamePrefix("FFmpeg-Async-");
        executor.initialize();
        return executor;
    }
}
