package com.example.backend.domain.feed.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.BDDMockito.given;

import com.example.backend.domain.feed.dto.FeedResponse;
import com.example.backend.domain.post.entity.Post;
import com.example.backend.domain.user.entity.User;
import com.example.backend.domain.post.repository.PostRepository;
import com.example.backend.domain.feed.service.connection.FeedTargetConnection;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.ListOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.ArrayList;
import java.util.List;


@ExtendWith(MockitoExtension.class)
class FeedServiceTest {

    //테스트할 실제 서비스 객체
    @InjectMocks
    private FeedService feedService;

    //가짜 의존성
    @Mock private FeedWarmUpComponent feedWarmUpComponent;//FeedService에서 가장 처음에 쓰이기 때문에 null 방지
    @Mock private StringRedisTemplate stringRedisTemplate;
    @Mock private PostRepository postRepository;
    @Mock private FeedTargetConnection feedTargetConnection;
    @Mock private ListOperations<String, String> listOperations;

    @Test
    @DisplayName("Redis 일반 게시물과 DB 인플루언서 게시물이 정상적으로 병합, 정렬, 슬라이싱된다.")
    void mergeAndSortTest(){

        //[1] GIVEN: 테스트를 위한 가상 데이터 준비
        Long currentUserId = 1L;
        int size = 2;

        User mockAuthor = User.builder().nickname("작성자").build();
        ReflectionTestUtils.setField(mockAuthor, "id", 2L);

        Post post10 = Post.builder().author(mockAuthor).content("일반글1").build();
        ReflectionTestUtils.setField(post10, "id", 10L);
        ReflectionTestUtils.setField(post10, "mediaList", new ArrayList<>());

        Post post30 = Post.builder().author(mockAuthor).content("일반글2").build();
        ReflectionTestUtils.setField(post30, "id", 30L);
        ReflectionTestUtils.setField(post30, "mediaList", new ArrayList<>());

        Post post20 = Post.builder().author(mockAuthor).content("인플루언서글1").build();
        ReflectionTestUtils.setField(post20, "id", 20L);
        ReflectionTestUtils.setField(post20, "mediaList", new ArrayList<>());

        Post post40 = Post.builder().author(mockAuthor).content("인플루언서글2").build();
        ReflectionTestUtils.setField(post40, "id", 40L);
        ReflectionTestUtils.setField(post40, "mediaList", new ArrayList<>());

        // 가정1: Redis에서는 post10, post30의 id를 갖고 있다
        given(stringRedisTemplate.opsForList()).willReturn(listOperations);
        given(listOperations.range("feed:timeline:1", 0, -1)).willReturn(List.of("10", "30"));

        // 가정2: DB에서는 id를 10, 30으로 검색하면 post10, post30을 출력한다
        given(postRepository.findAllById(List.of(10L, 30L))).willReturn(List.of(post10, post30));

        // 가정3:
        // - 현재 로그인한 사용자 1L은 인플루언서 사용자 2L와 팔로우 관계이다.
        // - DB에서 인플루언서 데이터로 post20, post40를 출력한다
        given(feedTargetConnection.feedPullTargetIds(currentUserId)).willReturn(List.of(2L));
        given(postRepository.findCelebrityPosts(eq(List.of(2L)), isNull(), any())).willReturn(List.of(post20, post40));

        //[2] WHEN: 테스트 대상 메서드 실행
        FeedResponse response = feedService.getFeedTimeline(currentUserId, null, size);

        //[3] THEN: 결과 확인
        // 3-1. 최종 응답에서 게시물만 추출
        List<FeedResponse.PostDto> resultPosts = response.posts();

        // 3-2. 결과 검증
        /*
        *   <예상 결과값>
        *   - 요청한 사이즈(=2) 만큼만 post 응답이 왔는지 확인
        *   - 피드 순서가 post40(가장 최신, 앞) -> post30 -> post20 -> post10 이 맞는지 확인
        *   - 다음 페이지가 존재하는지 확인
        *   - 무한 스크롤을 위해 마지막 게시물 번호를 cursor에 저장했는지 확인 (size=2로 마지막은 30L)
        */
        assertThat(resultPosts).hasSize(2);
        assertThat(resultPosts.get(0).postId()).isEqualTo(40L);
        assertThat(resultPosts.get(1).postId()).isEqualTo(30L);
        assertThat(response.hasNextPage()).isTrue();
        assertThat(response.nextCursor()).isEqualTo(30L);
    }
}
