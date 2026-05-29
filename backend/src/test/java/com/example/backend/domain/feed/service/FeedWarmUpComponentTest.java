package com.example.backend.domain.feed.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.backend.domain.feed.dto.FeedResponse;
import com.example.backend.domain.post.entity.Post;
import com.example.backend.domain.post.repository.PostRepository;
import com.example.backend.domain.user.entity.User;
import com.example.backend.domain.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;

//[통합 테스트] Lazy Loading 캐시 복구 통합 테스트
/*
* <테스트 목적>
* - 사용자가 피드를 조회할 때, 가장 먼저 Redis 캐시가 비어있는 상황을 감지해야 합니다.
* - 만약 캐시가 비어있다면, 로직(친구 목록 조회 → DB 게시글 조회 → Redis 캐시 업데이트 파이프라인 실행)이
*   정상 작동하여, 결론적으로 Redis 캐시에 실시간으로 `postId`를 자동 복구해야 합니다.
*/

@SpringBootTest
class FeedWarmUpComponentTest {

    @Autowired private FeedService feedService;
    @Autowired private StringRedisTemplate stringRedisTemplate;
    @Autowired private UserRepository userRepository;
    @Autowired private PostRepository postRepository;

    //테스트 데이터
    private Long createdUserId;

    //테스트 종료 후 실행: Redis에 임시로 추가된 캐시 Key만 청소
    @AfterEach
    void cleanUp(){
        postRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();

        if (createdUserId != null) {
            stringRedisTemplate.delete("feed:timeline:" + createdUserId);
        }
    }

    @Test
    @DisplayName("Redis 캐시가 초기화된 상황(Cache Miss)에서 피드를 요청하면, 시스템이 죽지 않고 Warm-up 파이프라인을 가동해 복구한다.")
    void warmupIfEmptyTest(){
        //[1] GIVEN
        User normalUser = userRepository.save(User.builder()
                .nickname("테스트유저")
                .build());

        createdUserId = normalUser.getId();

        Post post = postRepository.save(Post.builder()
                .author(normalUser)
                .content("테스트 게시물 내용")
                .build());

        postRepository.save(post);

        String redisKey = "feed:timeline:" + createdUserId;

        //의도적으로 Redis 초기화
        stringRedisTemplate.delete(redisKey);

        //[2] WHEN: Redis 캐시가 초기화된 상태에서 피드 조회 로직 호출
        FeedResponse response = feedService.getFeedTimeline(createdUserId, null, 20);

        //[3] THEN
        /*
        * <예상 결과값>
        * - 응답이 null이 아닌 정상적으로 나오는지 확인
        * - Redis Key가 재생성되는지 검증
        */
        assertThat(response).isNotNull();

        Boolean isRecovered = stringRedisTemplate.hasKey(redisKey);
        assertThat(isRecovered).isTrue();
    }
}
