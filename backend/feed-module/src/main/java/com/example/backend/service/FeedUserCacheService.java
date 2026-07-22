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

    private static final String REDIS_FEED_KEY_PREFIX = "feed:timeline:";
    private static final String REDIS_FOLLOWERS_KEY_PREFIX = "feed:followers:";
    private static final String REDIS_FOLLOWINGS_KEY_PREFIX = "feed:followings:";
    private static final String REDIS_CELEBRITY_KEY = "feed:celebrities";

    // [user 모듈의 유저 탈퇴]
    @Transactional
    public void  softDeleteFeedUserCache(Long userId){
        String strUserId = String.valueOf(userId); // 탈퇴자(B)
        String followersKey = REDIS_FOLLOWERS_KEY_PREFIX + userId; // 탈퇴자(B)를 팔로워하는 사람들(A)

        // 1. 탈퇴자(B)를 팔로우하던 사람들(A) 목록 가져오기
        Set<String> followers = stringRedisTemplate.opsForSet().members(followersKey);

        if(followers != null && !followers.isEmpty()){
            // 2. 일반 사용자들(A)의 레디스에서 탈퇴자(B) 데이터만 삭제
            for(String followerId : followers){
                // 2-1. A의 팔로잉 목록에서 B만 제거
                String followerFollowingsKey = REDIS_FOLLOWINGS_KEY_PREFIX + followerId;
                stringRedisTemplate.opsForSet().remove(followerFollowingsKey, strUserId);

                // 2-2. A의 피드 타임라인에서 B의 게시물 제거
                String followerTimeLineKey = REDIS_FEED_KEY_PREFIX + followerId;
                removeUserPostsFromTimeline(followerTimeLineKey, strUserId);
            }
        }

        // 3. 탈퇴자(B) 본인의 키 삭제
        String followingsKey = REDIS_FOLLOWINGS_KEY_PREFIX + userId;
        String timelineKey = REDIS_FEED_KEY_PREFIX + userId;

        stringRedisTemplate.delete(Arrays.asList(followersKey, followingsKey, timelineKey));

        // 4. 인플루언서 목록에서 탈퇴자(B) 제거
        stringRedisTemplate.opsForSet().remove(REDIS_CELEBRITY_KEY, strUserId);

        // 5. feed_post_index_cache DB 하드 삭제
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
