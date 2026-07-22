package com.example.backend.service;

import com.example.backend.entity.UserCache;
import com.example.backend.exception.NotFoundException;
import com.example.backend.repository.UserCacheRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserCacheService {

    private final UserCacheRepository userCacheRepository;

    // [user 모듈의 유저 탈퇴]
    @Transactional
    public void softDeleteUserCache(Long userId){
        // 1. UserCache DB에 해당 유저가 존재하는지 확인
        UserCache userCache = userCacheRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("사용자의 userId를 찾을 수 없습니다."));

        // 2. status = 'WITHDRAWN'(탈퇴) 상태로 변경
        userCache.userSoftDelete();
    }
}
