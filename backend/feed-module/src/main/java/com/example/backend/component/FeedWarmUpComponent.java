package com.example.backend.component;

import com.example.backend.domain.post.entity.Post;
import com.example.backend.domain.post.repository.PostRepository;
import com.example.backend.domain.feed.service.connection.FeedTargetConnection;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

//[Redis가 비어있을때 방어 작동]
/*
 * 오랜만에 접속한 사용자의 초기화된 Redis에
 * 최신 postId 500개를 한번에 채워주는 메서드
 */

@Slf4j
@Component
@RequiredArgsConstructor
public class FeedWarmUpComponent {

    private final StringRedisTemplate stringRedisTemplate;
    private final PostRepository postRepository;
    private final FeedTargetConnection feedTargetConnection;

    private static final String REDIS_FEED_KEY_PREFIX = "feed:timeline:";
    private static final int MAX_WARMUP_SIZE = 500;

    //[Redis 캐시 상태 점검] 사용자의 피드 조회 시 가장 먼저 Redis 점검
    /* @Param currentUserId: 현재 사용자(복구 대상)의 ID */
    public void warmupIfEmpty(Long currentUserId){
        String key = REDIS_FEED_KEY_PREFIX + currentUserId;
        Boolean hasKey = stringRedisTemplate.hasKey(key);

        //저장된 캐시가 있다면 아무 작업도 하지 않음
        if(Boolean.TRUE.equals(hasKey)){
            return;
        }

        log.warn("[Redis 캐시 비어있음 감지] Warm-Up 시작 userId: {}", currentUserId);

        //1.[네트워크 복구] 내가 팔로우하는 모든 친구들의 ID 목록 추출
        List<Long> followingsIds = feedTargetConnection.feedPushTargetIds(currentUserId);

        if(followingsIds.isEmpty()){
            return;
        }

        //2.[DB 복구] 일반 팔로워들이 작성한 postId 500개를 DB에서 가져옴
        List<Post> recentNormalPosts = postRepository.findRecentPostsForWarmUp(
                followingsIds,
                PageRequest.of(0, MAX_WARMUP_SIZE)
        );

        if(recentNormalPosts.isEmpty()){
            return;
        }

        //3.[Redis에 추가]
        /*
         * - 문제: 만약 팔로워가 1,000명일 때 for문을 돌면서 레디스를 호출하면 네트워크 부하가 걸림
         * - 해결책: 파이프라이닝을 사용하여 1,000개의 명령어를 하나의 패킷으로 묶어 레디스에 단 1번의 네트워크 통신으로 전송
         */
        stringRedisTemplate.executePipelined((RedisCallback<Object>) connection -> {
            byte[] rawKey = stringRedisTemplate.getStringSerializer().serialize(key);

            for(Post post : recentNormalPosts){
                byte[] rawValue = stringRedisTemplate.getStringSerializer().serialize(String.valueOf(post.getId()));
                connection.listCommands().rPush(rawKey, rawValue);
            }
            return null;
        });

        log.info("[Warm-Up 완료] {}개의 게시글 복구됨",recentNormalPosts.size());
    }
}
