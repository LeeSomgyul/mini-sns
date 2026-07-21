package com.example.backend.service;

import com.example.backend.entity.UserFollowCache;
import com.example.backend.kafka.FollowCountUpdatedEvent;
import com.example.backend.repository.UserFollowCacheRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserFollowCacheService {

    private final StringRedisTemplate stringRedisTemplate;
    private final UserFollowCacheRepository userFollowCacheRepository;

    private static final String REDIS_USERSEARCH_FOLLOW_CACHE_PREFIX = "usersearch:following";

    // [팔로우 & 언팔로우 시 UserFollowCache DB 업데이트]
    @Transactional
    public void updateCache(FollowCountUpdatedEvent event){
        Long followerId = event.followerId();
        Long followeeId = event.followeeId();
        String action = event.action();

        // 팔로우: UserFollowCache에 팔로우 관계 저장
        // 언팔로우: UserFollowCache의 팔로우 관계 삭제
        if("FOLLOW".equalsIgnoreCase(action)){
            // 이미 팔로우 관계가 DB에 존재하는지 확인
            if(userFollowCacheRepository.findByFollowerIdAndFolloweeId(followerId, followeeId).isEmpty()){
                UserFollowCache userFollowCache = UserFollowCache.builder()
                        .followerId(followerId)
                        .followeeId(followeeId)
                        .createdAt(event.created_at())
                        .build();
                userFollowCacheRepository.save(userFollowCache);
                log.info("[UserFollowCache에 팔로우 관계 추가 성공] {} -> {}", followerId, followeeId);
            }
        }else if("UNFOLLOW".equalsIgnoreCase(action)){
            userFollowCacheRepository.deleteByFollowerIdAndFolloweeId(followerId, followeeId);
            log.info("[UserFollowCache에 언팔로우 삭제 성공] {} -> {}", followerId, followeeId);
        }

        // 팔로우 & 언팔로우로 인해 DB가 업데이트 되었기 때문에 기존 키 삭제
        updateRedis(followerId);
    }

    // [Redis 키 업데이트]
    // 팔로우 & 언팔로우 발생 시 기존 followerId(본인)의 키 삭제
    // 다음에 게시물의 태그 추가로 검색기능 사용 시 Redis 다시 업데이트 예정
    public void updateRedis(Long followerId){
        String redisKey = REDIS_USERSEARCH_FOLLOW_CACHE_PREFIX + followerId;
        stringRedisTemplate.delete(redisKey);
        log.info("[레디스 키 삭제] Key: {}", redisKey);
    }
}
