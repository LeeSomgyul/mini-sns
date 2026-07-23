package com.example.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeedUserCacheAsyncService {

    private final StringRedisTemplate stringRedisTemplate;

    private static final String REDIS_FOLLOWINGS_KEY_PREFIX = "feed:followings:";
    private static final String REDIS_FOLLOWERS_KEY_PREFIX = "feed:followers:";
    private static final String REDIS_FEED_KEY_PREFIX = "feed:timeline:";

    @Async("feedCleanupExecutor")
    public void cleanupFollowersTimelineAsync(Set<String> followers, Set<String> followings,String targetUserId){
        log.info("[비동기 레디스 청소 시작] 팔로워 {}명의 캐시 정리 시작. targetUserId: {}", followers.size(), targetUserId);

        // 1. 탈퇴자(B)를 팔로우하던 사람들(A)의 캐시 정리
        if(followers != null && !followers.isEmpty()){
            for(String followerId : followers){
                try{
                    // 1-1. A의 팔로잉 목록에서 B만 제거
                    String followerFollowingsKey = REDIS_FOLLOWINGS_KEY_PREFIX + followerId;
                    stringRedisTemplate.opsForSet().remove(followerFollowingsKey, targetUserId);

                    // 1-2. A의 피드 타임라인에서 B의 게시물 제거
                    String followerTimeLineKey = REDIS_FEED_KEY_PREFIX + followerId;
                    removeUserPostsFromTimeline(followerTimeLineKey, targetUserId);
                } catch (Exception e) {
                    log.error("[비동기 레디스 청소 중 오류] 팔로워 id: {}", followerId, e);
                }
            }
        }

        // 2. 탈퇴자(B)가 팔로우하던 사람들(A)의 캐시 정리
        if(followings != null && !followings.isEmpty()){
            for(String followingId : followings){
                try{
                    // 2-1. A의 팔로워 목록에서 B 제거
                    String targetFollowersKey = REDIS_FOLLOWERS_KEY_PREFIX + followingId;
                    stringRedisTemplate.opsForSet().remove(targetFollowersKey, targetUserId);
                }catch (Exception e){
                    log.error("[비동기 레디스 청소 중 오류] 팔로잉 id: {}", followingId, e);
                }
            }
        }

        log.info("[비동기 레디스 청소 완료] targetUserId: {} 의 팔로워 캐시 정리 작업 완료", targetUserId);
    }


    // ==================== [메서드] ====================
    // [일반 사용자(A)의 피드 타임라인 레디스에서 탈퇴자(B) 게시물만 찾아서 삭제]
    private void removeUserPostsFromTimeline(String timelineKey, String authorId){
        // 1. "authorId:*" 패턴에 해당하는 값만 100개씩 찾기 ("feed":"timeline":userId:"authorId:postId" 형식임)
        ScanOptions options = ScanOptions.scanOptions()
                .match(authorId + ":*")
                .count(100)
                .build();

        // 2. 값 다 찾아온 뒤 연결 해제하여 메모리 누수 방지
        try(Cursor<ZSetOperations.TypedTuple<String>> cursor = stringRedisTemplate.opsForZSet().scan(timelineKey, options)){

            List<String> keysToRemove = new ArrayList<>();

            while (cursor.hasNext()){
                ZSetOperations.TypedTuple<String> tuple = cursor.next();

                if(tuple.getValue() != null){
                    keysToRemove.add(tuple.getValue());
                }
            }

            // 한번에 삭제
            if(!keysToRemove.isEmpty()){
                stringRedisTemplate.opsForZSet().remove(timelineKey, keysToRemove.toArray());
            }
        } catch (Exception e) {
            log.error("타임라인 스캔 및 삭제 중 오류 발생. timelineKey: {}, authorId: {}", timelineKey, authorId, e);
        }
    }
}
