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
public class FeedPostDeletedConsumer {

    private final FeedService feedService;

    @KafkaListener(
            topics = KafkaTopics.POST_DELETED_TOPIC,
            groupId = KafkaGroupId.GROUP_FEED_POST_DELETE,
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consume(FeedPostDeletedEvent event){
        log.info("[Kafka Consume 수신 성공] topics: {}, PostId: {}, AuthorId: {}",
                KafkaTopics.POST_DELETED_TOPIC,event.postId(), event.authorId());

        try{
            feedService.deleteFeedPostIndexCache(event.postId(), event.authorId());
        }catch(Exception e){
            log.info("[Kafka Consume 처리 실패]  topics: {}, PostId: {}, AuthorId: {}",
                KafkaTopics.POST_DELETED_TOPIC,event.postId(), event.authorId(),e);
        }
    }
}
