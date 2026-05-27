package com.example.backend.infrastructure.kafka.feed;

import com.example.backend.service.connection.FeedTargetConnection;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.StringRedisConnection;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class FeedPushEventConsumer {

    private final StringRedisTemplate stringRedisTemplate;
    private final FeedTargetConnection feedTargetConnection;

    private static final String REDIS_FEED_KEY_PREFIX = "feed:timeline:";
    private static final int MAX_TIMELINE_SIZE = 499;

    //[카프카 메시지를 받으면 아래 메서드 수행]
    /*
    *   - 메서드 작동 시기: "일반 사용자의 게시글이 생성되었다" 라는 이벤트가 발생하면 아래 메서드 수행
    *   - 메서드 역할: 해당 게시물 작성자의 팔로워들을 찾아내어, 각 팔로워들의 Redis 키에 postId를 비동기로 저장
    */

    @KafkaListener(
            topics = "feed.post.created",
            groupId = "mini-sns-feed-backend"
    )
    public void savePushPostIds(FeedPushEvent event){
        //1. [타겟 추출] postId를 전달 받아야 하는 사용자들 찾기
        List<Long> targetIds = feedTargetConnection.feedPushTargetIds(event.authorId());
        String postIdStr = String.valueOf(event.postId());

        if(targetIds.isEmpty()){
            return;
        }

        //2. [Redis에 추가]
        /*
        * - 문제: 만약 팔로워가 1,000명일 때 for문을 돌면서 레디스를 호출하면 네트워크 부하가 걸림
        * - 해결책: 파이프라이닝을 사용하여 1,000개의 명령어를 하나의 패킷으로 묶어 레디스에 단 1번의 네트워크 통신으로 전송
        */
        stringRedisTemplate.executePipelined((RedisCallback<Object>) connection -> {
            StringRedisConnection stringRedisConnection = (StringRedisConnection) connection;

            for(Long targetId : targetIds){
                String key = REDIS_FEED_KEY_PREFIX + targetId;

                //사용자의 레디스 리스트 왼쪽에 최신 postId 삽입
                stringRedisConnection.lPush(key, postIdStr);

                //리스트 범위를 500개로 제한하고 오래된 글은 제거(500개 뒤의 오래된 글은 DB에서 직접 가져오기)
                stringRedisConnection.lTrim(key, 0, MAX_TIMELINE_SIZE);
            }
            return null;
        });

        log.info("📥 비동기 Push 완료: postId: {} 가 {} 명의 팔로워 Redis에 저장되었습니다.", event.postId(), targetIds.size());
    }
}
