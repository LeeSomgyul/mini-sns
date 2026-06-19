package com.example.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling // 스케줄링 기능 활성화 (게시물 소프트 삭제 후 일정기간 지나면 자동 실제 삭제)
@SpringBootApplication
public class PostApplication {
    public static void main(String[] args) {

        SpringApplication.run(PostApplication.class, args);
    }
}