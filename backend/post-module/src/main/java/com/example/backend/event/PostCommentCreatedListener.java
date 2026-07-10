package com.example.backend.event;

import com.example.backend.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class PostCommentCreatedListener {

    private final PostRepository postRepository;

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW) // 부모(PostCommentService)의 @Transactional와 별개라고 선언
    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT, // 댓글 DB 저장이 최종 커밋 완료된 이후에 다음 핸들러 실행
            fallbackExecution = false
    )
    public void handlePostCommentCreate(PostCommentCreatedEvent event){
        log.info("[댓글 카운트 증가 이벤트 수신 요청] postId: {}", event.postId());

        try{
            postRepository.incrementCommentCount(event.postId());
            log.info("[댓글 카운트 증가 이벤트 업데이트 완료] postId: {}", event.postId());
        }catch(Exception e){
            log.info("[댓글 카운트 증가 이벤트 업데이트 실패] postId: {}", event.postId(), e);
        }
    }
}
