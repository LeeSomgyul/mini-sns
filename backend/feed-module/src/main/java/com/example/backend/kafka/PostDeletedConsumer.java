package com.example.backend.kafka;

import com.example.backend.config.kafka.KafkaGroupId;
import com.example.backend.config.kafka.KafkaTopics;
import com.example.backend.service.FeedService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PostDeletedConsumer {

    private final FeedService feedService;

    @KafkaListener(
            topics = KafkaTopics.FEED_POST_DELETED_TOPIC,
            groupId = KafkaGroupId.GROUP_POST_SOFT_DELETE,
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumerPostDeleted(PostDeletedEvent event){
        log.info("[Kafka Consume 수신 성공] post 모듈에서 삭제 이벤트를 받았습니다. PostId: {}, AuthorId: {}",
                event.postId(), event.authorId());

        try{
            feedService.deleteFeedPostIndexCache(event.postId(), event.authorId());
        }catch(Exception e){
            log.info("[Kafka Consume 처리 실패] post 모듈에서 삭제 이벤트를 처리하는데 실패하였습니다. PostId: {}",
                    event.postId(), e);
        }
    }
}
