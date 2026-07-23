package com.example.backend.service;

import com.example.backend.kafka.FollowCountUpdatedConsumer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthAsyncService {

    private final StringRedisTemplate stringRedisTemplate;

    private static final String REDIS_FOLLOWER_SET = "user:%s:follower_set";
    private static final String REDIS_FOLLOWING_SET = "user:%s:following_set";
    private static final String REDIS_FOLLOWER_COUNT = "user:%s:follower_count";
    private static final String REDIS_FOLLOWING_COUNT = "user:%s:following_count";

    @Async("userCleanupExecutor")
    public void cleanupUserDataAsync(Long targetUserId){
        log.info("[비동기 레디스 청소 시작] targetUserId: {}", targetUserId);

        // a: 일반사용자, b: 탈퇴자
        String bFollowingSetKey = String.format(REDIS_FOLLOWING_SET, targetUserId);
        String bFollowerSetKey = String.format(REDIS_FOLLOWER_SET, targetUserId);
        
        // 1. 탈퇴자(B)가 팔로우하던 유저들(A) 조회 및 수정
        Set<String> aUserIds = stringRedisTemplate.opsForSet().members(bFollowingSetKey);
        if(aUserIds != null && !aUserIds.isEmpty()){
            for(String aUserId : aUserIds){
                try{
                    // 유저(A)의 follower_set에서 탈퇴자(B) 제거
                    String aFollowerSetKey = String.format(REDIS_FOLLOWER_SET, aUserId);
                    stringRedisTemplate.opsForSet().remove(aFollowerSetKey, String.valueOf(targetUserId));
                    
                    // 유저(A)의 follower_count 1 감소
                    String aFollowerCountKey = String.format(REDIS_FOLLOWER_COUNT, aUserId);
                    decrementAndCheckBound(aFollowerCountKey);
                }catch (Exception e){
                    log.info("[비동기 레디스 청소 실패] 탈퇴자가 팔로우하던 일반 사용자: {}", aUserId, e);
                }
            }
        }
        
        // 2. 탈퇴자(B)를 팔로우하던 유저들(C) 조회 및 수정
        Set<String> cUserIds = stringRedisTemplate.opsForSet().members(bFollowerSetKey);
        if(cUserIds != null && !cUserIds.isEmpty()){
            for(String cUserId : cUserIds){
                try{
                    // 유저(C)의 following_set에서 탈퇴자(B) 제거
                    String cFollowingSetKey = String.format(REDIS_FOLLOWING_SET, cUserId);
                    stringRedisTemplate.opsForSet().remove(cFollowingSetKey, String.valueOf(targetUserId));
                    
                    // 유저(C)의 following_count 1 감소
                    String cFollowingCountKey = String.format(REDIS_FOLLOWING_COUNT, cUserId);
                    decrementAndCheckBound(cFollowingCountKey);
                }catch (Exception e){
                    log.info("[비동기 레디스 청소 실패] 탈퇴자를 팔로우하던 일반사용자: {}", cUserId, e);
                }
            }
        }

        // 3. 탈퇴자(B) 본인의 4개 키 모두 삭제
        List<String> keysToDelete = List.of(
            bFollowingSetKey,
            bFollowerSetKey,
            String.format(REDIS_FOLLOWING_COUNT, targetUserId),
            String.format(REDIS_FOLLOWER_COUNT, targetUserId)
        );
        stringRedisTemplate.delete(keysToDelete);

        log.info("[비동기 레디스 청소 완료] targetUserId: {}", targetUserId);
    }



    // ==================== [메서드] ====================
    // [팔로우 & 팔로잉 count 차감 및 음수 방지]
    private void decrementAndCheckBound(String key){
        // count에서 -1하고 남은 수
        Long remaining = stringRedisTemplate.opsForValue().decrement(key);
        
        if(remaining != null && remaining < 0){
            stringRedisTemplate.opsForValue().set(key, "0");
        }
    }
}
