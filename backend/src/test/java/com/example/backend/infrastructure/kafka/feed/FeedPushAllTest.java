package com.example.backend.infrastructure.kafka.feed;

import com.example.backend.domain.post.repository.PostRepository;
import com.example.backend.domain.user.entity.User;
import com.example.backend.domain.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.test.context.EmbeddedKafka;

//[비동기 파이프라인 전체 테스트]
/*
* <테스트 목적>
* - Publisher => Event => Kafka => Consumer => Redis 전 과정 흐름 테스트
*/

@SpringBootTest
@EmbeddedKafka(
    partitions = 1,
    brokerProperties = {"listeners=PLAINTEXT://localhost:9094", "port=9094"},
    topics = {"feed.post.created"}
)
class FeedPushAllTest {

    @Autowired private StringRedisTemplate stringRedisTemplate;
    @Autowired private UserRepository userRepository;
    @Autowired private PostRepository postRepository;

    @AfterEach
    void cleanUp(){
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

        Long userId = normalUser.getId();
        String redisKey = "feed:timeline:" + userId;
    }
}
