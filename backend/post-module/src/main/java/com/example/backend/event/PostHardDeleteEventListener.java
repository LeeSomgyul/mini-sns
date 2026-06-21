package com.example.backend.event;

import com.example.backend.kafka.PostDeletedPublisher;
import com.example.backend.kafka.PostHardDeletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class PostHardDeleteEventListener {

    private final PostDeletedPublisher postDeletedPublisher;

    // DB에서 삭제 대상 데이터 삭제 완료 후 MiniO 삭제를 위한 카프카 메시지 전송 실행
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handlePostHardDelete(PostHardDeleteCompletedEvent event){
        log.info("[handlePostHardDelete 진입] DB 데이터 삭제 완료. 카프카 이벤트를 전송합니다.");

        List<Long> postIds = event.postId();

        postIds.forEach(postId -> {
            List<String> deletedTargetUrl = event.deletedTargetUrls().getOrDefault(postId, List.of());
            try{
                PostHardDeletedEvent kafkaEvent = PostHardDeletedEvent.of(postId, deletedTargetUrl);
                postDeletedPublisher.publishPostHardDeleted(kafkaEvent);
            }catch(Exception e){
                log.error("[handlePostHardDelete 실패] postId: {} 카프카 전송 실패", postId, e);
            }
        });
    }
}
