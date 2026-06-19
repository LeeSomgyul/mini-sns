package com.example.backend.connection;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class FriendshipTargetConnection implements FeedTargetConnection{

    private final StringRedisTemplate stringRedisTemplate;

    // [REDIS KEY]
    // 1. A라는 유저를 팔로우하는 일반 사람들 명단 (userId)
    private static final String REDIS_FOLLOWERS_KEY_PREFIX = "feed:followers:";
    // 2. 시스템 내에서 인플루언서 전체 명단 (userId)
    private static final String REDIS_CELEBRITY_KEY = "feed:celebrities";
    // 3. A라는 유저가 팔로우하는 사람들 명단 (userId)
    private static final String REDIS_FOLLOWINGS_KEY_PREFIX = "feed:followings:";


    /*
     * [Push 대상 조회]
     * - 실행 시점: 일반 사용자가 글을 작성한 직후 호출되는 메서드
     * - 게시글 작성자의 팔로워 userId 목록을 Redis (REDIS_FOLLOWERS_KEY_PREFIX) 에서 조회
     * @param authorId: 글을 작성한 일반 사용자의 고유 ID
     * @return 데이터를 실시간으로 Push 받을 팔로워들의 ID 리스트(🚨현재는 모든 ID 반환중🚨)
     */
    @Override
    public List<Long> feedPushTargetIds(Long authorId) {
        // 1. feed:followers:각자 id
        String redisKey = REDIS_FOLLOWERS_KEY_PREFIX + authorId;

        // 2. 게시물 작성자의 팔로워를 Set에 모두 가져오기
        Set<String> followers = stringRedisTemplate.opsForSet().members(redisKey);

        // 3. 팔로우 유무 확인
        if(followers == null || followers.isEmpty()){
            log.info("작성자({})를 팔로우하는 사용자가 Redis에 존재하지 않습니다.", authorId);
            return Collections.emptyList();
        }

        // 4. 게시물 작성자의 팔로워 리스트를 String -> Long 타입으로 변경 후 리턴
        return followers.stream()
                .map(Long::valueOf)
                .toList();
    }

    /*
     * [Pull 대상 조회]
     * - 실행 시점: 사용자가 자신의 피드를 새로고침 하는 순간
     * - 시스템 내 인플루언서 userId 목록을 Redis Set에서 조회
     * @param currentUserId: 피드를 조회하고 있는 현재 로그인한 사용자의 고유 ID
     * @return 내가 팔로우 중인 인플루언서들의 ID 리스트(🚨현재는 모든 ID 반환중🚨)
     */
    @Override
    public List<Long> feedPullTargetIds(Long currentUserId) {
        Set<String> celebrities = stringRedisTemplate.opsForSet().members(REDIS_CELEBRITY_KEY);

        if(celebrities == null || celebrities.isEmpty()){
            return Collections.emptyList();
        }

        return celebrities.stream()
                .map(Long::valueOf)
                .toList();
    }

    /*
     * [내가 팔로우하는 유저 ID 목록 조회]
     * - 실행 시점: 사용자의 Redis 타임라인이 비어있어 로컬 캐시(인덱스)에서 최신 글을 복구해야 할 때
     * @param currentUserId: 현재 로그인한 사용자의 고유 ID
     * @return 내가 팔로우 중인 일반 사용자들의 ID 리스트 (feed:followings:{currentUserId} 에서 조회)
     */
    @Override
    public List<Long> feedFollowingIds(Long currentUserId) {
        String redisKey =REDIS_FOLLOWINGS_KEY_PREFIX + currentUserId;

        Set<String> followings = stringRedisTemplate.opsForSet().members(redisKey);

        if(followings == null || followings.isEmpty()){
            log.info("유저({})가 팔로우하는 사용자가 Redis에 존재하지 않습니다.", currentUserId);
            return Collections.emptyList();
        }

        return followings.stream()
                .map(Long::valueOf)
                .toList();
    }
}
