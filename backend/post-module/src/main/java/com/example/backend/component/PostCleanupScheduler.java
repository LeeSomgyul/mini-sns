package com.example.backend.component;

import com.example.backend.service.PostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

// [하루의 일정 시간마다 작동되는 삭제 실행 메서드]
@Slf4j
@Component
@RequiredArgsConstructor
public class PostCleanupScheduler {

    private final PostService postService;

    // 매일 새벽 3시에 실행
    //@Scheduled(fixedDelay = 10000)
    @Scheduled(cron = "0 0 3 * * ?")
    public void scheduleHardDelete(){
        // 30일 이전 소프트 삭제된 데이터 제거
        LocalDateTime baselineDate = LocalDateTime.now().minusDays(30);
        //LocalDateTime baselineDate = LocalDateTime.now().minusSeconds(5);

        log.info("[DB 및 MiniO 정리] 클린 스케줄이 실행됩니다.");
        postService.cleanupExpiredPosts(baselineDate);
    }
}
