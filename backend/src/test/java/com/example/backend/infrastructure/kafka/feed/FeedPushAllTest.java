package com.example.backend.infrastructure.kafka.feed;

import com.example.backend.domain.post.dto.PostRequest;
import com.example.backend.domain.post.repository.PostMediaRepository;
import com.example.backend.domain.post.repository.PostRepository;
import com.example.backend.domain.post.service.PostService;
import com.example.backend.domain.user.entity.User;
import com.example.backend.domain.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.test.context.EmbeddedKafka;

import java.time.Duration;
import java.util.List;

import static org.awaitility.Awaitility.await;
import static org.assertj.core.api.Assertions.assertThat;

//[비동기 파이프라인 전체 테스트]
/*
* <테스트 목적>
* - Publisher => Event => Kafka => Consumer => Redis 전 과정 흐름 테스트
*/

@SpringBootTest
@EmbeddedKafka(
    partitions = 1,
    topics = {"feed.post.created"}
)
class FeedPushAllTest {

    @Autowired private StringRedisTemplate stringRedisTemplate;
    @Autowired private UserRepository userRepository;
    @Autowired private PostRepository postRepository;
    @Autowired private PostMediaRepository postMediaRepository;
    @Autowired private PostService postService;

    //자식 -> 부모 순서대로 청소
    @AfterEach
    void cleanUp(){
        postMediaRepository.deleteAllInBatch();
        postRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();
    }

    @Test
    @DisplayName("비동기 파이프라인 검증: 게시물 발행 이벤트 발생 시 카프카를 거쳐 레디스 서랍장에 ID가 순차 적재된다.")
    void kafkaFeedEventDeliveryTest(){

        //[1] GIVEN
        User normalUser = userRepository.save(User.builder()
                    .nickname("Kafka 테스트유저")
                    .build()
        );

        Long authorId = normalUser.getId();
        String redisKey = "feed:timeline:" + authorId;

        stringRedisTemplate.delete(redisKey);// 원활한 테스트를 위해 검증 전 레디스 청소

        PostRequest.MediaUploadRequest mockMedia = PostRequest.MediaUploadRequest.builder()
                .mediaUrl("https://my-s3-bucket.com/images/test.jpg")//존재하지 않는 가짜 url
                .mediaType("IMAGE")
                .originalFileName("test.jpg")
                .build();

        PostRequest postRequest = PostRequest.builder()
                .mediaList(List.of(mockMedia))
                .content("Kafka를 거쳐서 Redis로 배달될 비동기 게시물 본문입니다.")
                .build();

        //[2] WHEN: 게시물 생성
        postService.createPost(authorId, postRequest);

        //[3] THEN: 레디스에 postId가 잘 저장되었는지(0개가 아닌지) 테스트
        await().atMost(Duration.ofSeconds(5))
                .untilAsserted(() -> {
                    Long size = stringRedisTemplate.opsForList().size(redisKey);
                    assertThat(size).isGreaterThan(0);
                });
    }
}
