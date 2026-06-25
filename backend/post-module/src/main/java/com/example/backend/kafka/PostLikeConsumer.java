package com.example.backend.kafka;

import com.example.backend.config.kafka.KafkaGroupId;
import com.example.backend.config.kafka.KafkaTopics;
import com.example.backend.entity.Post;
import com.example.backend.entity.PostLike;
import com.example.backend.exception.NotFoundException;
import com.example.backend.repository.PostLikeRepository;
import com.example.backend.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class PostLikeConsumer {

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;

    @Transactional
    @KafkaListener(
            topics = KafkaTopics.POST_LIKE_TOPIC,
            groupId = KafkaGroupId.GROUP_POST_LIKE,
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumer(PostLikeEvent event){
        log.info("[Kafka Consumer] 게시물 좋아요 이벤트 수신 - postId: {}, userId: {}", event.postId(), event.userId());

        // 1. 게시물 존재 여부 확인
        Post post = postRepository.findById(event.postId())
                .orElseThrow(() -> new NotFoundException("존재하지 않는 게시물입니다."));

        // 2. 현재 사용자가 이미 게시물에 좋아요를 눌렀는지 확인 후 PostLike 데이터 가져오기
        // - 좋아요 눌렀으면 데이터 가져오고, 좋아요 안눌렀으면 데이터 비어있는 상태로 가져옴
        Optional<PostLike> postLikeOpt = postLikeRepository.findByPostIdAndUserId(event.postId(), event.userId());

        // 3. 좋아요 여부
        boolean alreadyLiked = postLikeOpt.isPresent();

        // 4. 좋아요 DB 처리
        if(event.isLiked() && !alreadyLiked){
            // 4-1. 좋아요 요청인데 아직 좋아요 데이터가 없다면 DB에 추가하기
            postLikeRepository.save(PostLike.of(post, event.userId()));
            post.increaseLikeCount();
            log.info("[Kafka Consumer] 좋아요 등록 완료 - PostId: {}, UserId: {}", event.postId(), event.userId());
        }else if(!event.isLiked() && alreadyLiked){
            // 4-2. 좋아요 취소 요청인데 DB에 기존 데이터가 있다면 DB에 삭제
            postLikeRepository.delete(postLikeOpt.get());
            post.decreaseLikeCount();
            log.info("[Kafka Consumer] 좋아요 취소 완료 - PostId: {}, UserId: {}", event.postId(), event.userId());
        }else{
            // 4-3. 이미 처리 된 중복 요청이라면
            log.warn("[Kafka Consumer] 이미 처리된 중복 이벤트입니다 - Action: {}, AlreadyLiked: {}",
                    event.isLiked(), alreadyLiked);
        }
    }
}
