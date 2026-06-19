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

    // 🚨배포할때는 @Scheduled(cron = "0 0 3 * * ?")로 변경🚨
    // 현재는 테스트를 위해 5초마다 동작하도록 설정
    @Scheduled(fixedDelay = 5000)
    public void scheduleHardDelete(){
        // 기준 시간: 현재 시간으로부터 '5초 전'
        // 🚨배포할때는 LocalDateTime.now().minusDays(30); 로 변경🚨
        LocalDateTime baselineDate = LocalDateTime.now().minusSeconds(5);

        log.info("[DB 및 MiniO 정리] 클린 스케줄이 실행됩니다.");
        postService.cleanupExpiredPosts(baselineDate);
    }
}
