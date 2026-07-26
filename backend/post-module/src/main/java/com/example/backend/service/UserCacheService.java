package com.example.backend.service;

import com.example.backend.config.PostRedisKeyManager;
import com.example.backend.entity.UserCache;
import com.example.backend.exception.NotFoundException;
import com.example.backend.kafka.UserSoftDeleteEvent;
import com.example.backend.repository.UserCacheRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserCacheService {

    private final UserCacheRepository userCacheRepository;
    private final StringRedisTemplate stringRedisTemplate;

    // [user 모듈의 유저 탈퇴]
    @Transactional
    public void softDeleteUserCache(UserSoftDeleteEvent event){
        // 1. UserCache DB에 해당 유저가 존재하는지 확인
        UserCache userCache = userCacheRepository.findByUserId(event.userId())
                .orElseThrow(() -> new NotFoundException("사용자의 userId를 찾을 수 없습니다."));

        // 2. status = 'WITHDRAWN'(탈퇴) 상태로 변경
        userCache.userSoftDelete(event.deletedAt());

        // 3. [레디스] 게시물 개수 "user:%d:post_count" 키 삭제
        try{
            String postCountKey = PostRedisKeyManager.generateKey(PostRedisKeyManager.RedisKeyType.POST_COUNT, event.userId());
            Boolean deleted = stringRedisTemplate.delete(postCountKey);

            if(Boolean.TRUE.equals(deleted)){
                log.info("[비동기 레디스 청소 완료] userId: {}", event.userId());
            }
        } catch (Exception e) {
            log.info("[비동기 레디스 청소 실패] userId: {}", event.userId(), e);
        }
    }
}
