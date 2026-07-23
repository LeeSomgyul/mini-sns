package com.example.backend.service;

import com.example.backend.repository.FeedPostIndexCacheRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeedUserCacheService {

    private final FeedPostIndexCacheRepository feedPostIndexCacheRepository;
    private final StringRedisTemplate stringRedisTemplate;
    private final FeedUserCacheAsyncService feedUserCacheAsyncService;

    private static final String REDIS_FEED_KEY_PREFIX = "feed:timeline:";
    private static final String REDIS_FOLLOWERS_KEY_PREFIX = "feed:followers:";
    private static final String REDIS_FOLLOWINGS_KEY_PREFIX = "feed:followings:";
    private static final String REDIS_CELEBRITY_KEY = "feed:celebrities";

    // [user 모듈의 유저 탈퇴]
    @Transactional
    public void  softDeleteFeedUserCache(Long userId){
        String strUserId = String.valueOf(userId); // 탈퇴자(B)
        String followersKey = REDIS_FOLLOWERS_KEY_PREFIX + userId; // 탈퇴자(B)를 팔로워하는 사람들(A)
        String followingsKey = REDIS_FOLLOWINGS_KEY_PREFIX + userId;
        String timelineKey = REDIS_FEED_KEY_PREFIX + userId;


        // 1. 탈퇴자(B)가 인플루언서인지 확인
        Boolean isCelebrity = stringRedisTemplate.opsForSet().isMember(REDIS_CELEBRITY_KEY, strUserId);

        if(Boolean.TRUE.equals(isCelebrity)){
            log.info("[회원 탈퇴] 탈퇴자가 인플루언서입니다. 비동기 팔로우 청소를 건너뜁니다. userId: {}", userId);

            // 인플루언서 목록에서 탈퇴자(B) 제거
            stringRedisTemplate.opsForSet().remove(REDIS_CELEBRITY_KEY, strUserId);
        }else{
            // 탈퇴자(B)를 팔로우하던 사람들(A) 목록 가져오기
            Set<String> followers = stringRedisTemplate.opsForSet().members(followersKey);

            // 탈퇴자(B)가 팔로우하던 사람들(A) 목록 가져오기
            Set<String> followings = stringRedisTemplate.opsForSet().members(followingsKey);

            // 비동기 팔로우 청소
            // (탈퇴자(B)의 팔로워수가 많을 수 있기 때문에 스레드를 별개로 하여 비동기로 처리)
            feedUserCacheAsyncService.cleanupFeedDataAsync(followers, followings, strUserId);
        }

        // 2. 탈퇴자(B) 본인의 키 삭제
        stringRedisTemplate.delete(Arrays.asList(followersKey, followingsKey, timelineKey));

        // 3. feed_post_index_cache DB 하드 삭제
        feedPostIndexCacheRepository.deleteByAuthorId(userId);

        log.info("[회원 탈퇴] 관련 DB 및 Redis Key 삭제 완료. userId: {}", userId);
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
