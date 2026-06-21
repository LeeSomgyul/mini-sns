package com.example.backend.event;

import com.example.backend.kafka.PostDeletedPublisher;
import com.example.backend.kafka.PostHardDeletedEvent;
import com.example.backend.kafka.PostHardDeletedPublisher;
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

    private final PostHardDeletedPublisher postHardDeletedPublisher;

    // DB에서 삭제 대상 데이터 삭제 완료 후 MiniO 삭제를 위해 삭제 목록 url 덩어리를 1개씩 쪼개는 역할
    // (1개 post에는 여러개의 url이 있기 때문에 쪼개개서 publisher에 전송해야 한다)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handlePostHardDelete(PostHardDeleteCompletedEvent event){
        log.info("[handlePostHardDelete 진입] DB 데이터 삭제 완료. 카프카 이벤트를 전송합니다.");

        List<Long> postIds = event.postId();

        postIds.forEach(postId -> {
            List<String> deletedTargetUrl = event.deletedTargetUrls().getOrDefault(postId, List.of());
            try{
                PostHardDeletedEvent kafkaEvent = PostHardDeletedEvent.of(postId, deletedTargetUrl);
                postHardDeletedPublisher.publishPostHardDeleted(kafkaEvent);
            }catch(Exception e){
                log.error("[handlePostHardDelete 실패] postId: {} 카프카 전송 실패", postId, e);
            }
        });
    }
}
