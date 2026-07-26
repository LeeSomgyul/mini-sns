package com.example.backend.component;

import com.example.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserCleanupScheduler {

    private final UserService userService;

    // [회원 탈퇴 - 하드 삭제] 매일 새벽 3시에 실행
    @Scheduled(cron = "0 0 3 * * ?")
    public void scheduleHardDelete(){
        LocalDateTime withdrawnAt = LocalDateTime.now().minusDays(30);

        log.info("[User & Follow DB 정리] 30일 경과 탈퇴 회원 하드삭제 스케줄러가 실행됩니다. (기준 시점: {})", withdrawnAt);
        userService.userHardDelete(withdrawnAt);
    }
}
