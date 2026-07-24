package com.example.backend.service;

import com.example.backend.repository.UserFollowCacheRepository;
import com.example.backend.repository.UserSearchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserSoftDeleteAsyncService {

    private final UserFollowCacheRepository userFollowCacheRepository;
    private final UserSearchRepository userSearchRepository;
    private final StringRedisTemplate stringRedisTemplate;

    private static final String REDIS_USERSEARCH_FOLLOW_CACHE_PREFIX = "usersearch:following:";

    @Async("usersearchCleanupExecutor")
    @Transactional
    public void cleanupUsersearchDataAsync(Long targetUserId){
        log.info("[회원탈퇴 발생으로 비동기 청소 시작] targetUserId: {}", targetUserId);

        try{
            // 1. 탈퇴자를 팔로우하고 있던 일반 유저들의 id목록 조회
            List<Long> followerIds = userFollowCacheRepository.findFollowerIdsByFolloweeId(targetUserId);
            log.info("[1] 조회된 팔로워 IDs: {}", followerIds);

            // 2. 탈퇴자를 팔로우하고 있는 사람들의 레디스에서 탈퇴자 제거
            if(!followerIds.isEmpty()){
                List<String> followerCacheKeys = followerIds.stream()
                        .map(followerId ->  REDIS_USERSEARCH_FOLLOW_CACHE_PREFIX + followerId)
                        .toList();

                stringRedisTemplate.delete(followerCacheKeys);
            }

            // 3. 탈퇴자 본인 레디스 캐시 삭제
            String myCacheKey = REDIS_USERSEARCH_FOLLOW_CACHE_PREFIX + targetUserId;
            stringRedisTemplate.delete(myCacheKey);

            // 4. DB 삭제
            userFollowCacheRepository.deleteByFollowerIdOrFolloweeId(targetUserId);

            // 5. 엘라스틱 서치 인덱스 문서 삭제
            userSearchRepository.deleteById(targetUserId);

            log.info("[회원탈퇴 비동기 청소 성공] targetUserId: {}", targetUserId);

        }catch (Exception e){
            log.info("[회원탈퇴 비동기 청소 실패] targetUserId: {}", targetUserId, e);
        }
    }
}
