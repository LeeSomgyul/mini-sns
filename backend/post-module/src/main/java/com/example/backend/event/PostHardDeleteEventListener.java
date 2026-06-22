package com.example.backend.event;

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
        log.info("[MiniO Urls 분리 진입] MiniO 삭제를 위해 Urls를 분리합니다.");
        log.info("▶ [데이터 확인] 들어온 Post ID 목록: {}", event.postIds());
        log.info("▶ [데이터 확인] 상세 urls 확인: {}", event.deletedTargetUrls());

        List<Long> postIds = event.postIds();

        postIds.forEach(postId -> {
            List<String> deletedTargetUrl = event.deletedTargetUrls().getOrDefault(postId, List.of());
            try{
                PostHardDeletedEvent kafkaEvent = PostHardDeletedEvent.of(postId, deletedTargetUrl);
                postHardDeletedPublisher.publishPostHardDeleted(kafkaEvent);
            }catch(Exception e){
                log.error("[MiniO Urls 분리 실패] postId: {} 카프카 전송 실패", postId, e);
            }
        });
    }
}
