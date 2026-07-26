package com.example.backend.component;

import com.example.backend.service.PostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

// [하루의 일정 시간마다 작동되는 삭제 실행 메서드]
@Slf4j
@Component
@RequiredArgsConstructor
public class PostCleanupScheduler {

    private final PostService postService;

    // [게시물 소프트삭제 30일 이후 하드삭제 스케줄러] 매일 새벽 3시에 실행
    //@Scheduled(fixedDelay = 10000)
    @Scheduled(cron = "0 0 3 * * ?")
    public void scheduleHardDelete(){
        // 30일 이전 소프트 삭제된 데이터 제거
        LocalDateTime baselineDate = LocalDateTime.now().minusDays(30);
        //LocalDateTime baselineDate = LocalDateTime.now().minusSeconds(5);

        log.info("[게시물 삭제] DB 및 MiniO 정리 클린 스케줄이 실행됩니다.");
        postService.cleanupExpiredPosts(baselineDate);
    }

    // [회원탈퇴 이후 30일 경과되어 하드삭제 스케줄러] 매일 새벽 3시 30분에 실행
    @Scheduled(cron = "0 30 3 * * ?")
    public void scheduleWithdrawnUserCleanup(){
        Instant baselineDate = Instant.now().minus(30, ChronoUnit.DAYS);

        log.info("[회원 탈퇴] DB 및 MiniO 정리 클린 스케줄이 실행됩니다.");
        postService.cleanupWithdrawnUsers(baselineDate);
    }
}
