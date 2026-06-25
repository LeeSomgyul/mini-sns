package com.example.backend.service;

import com.example.backend.dto.PostLikeRequest;
import com.example.backend.kafka.PostLikeEvent;
import com.example.backend.kafka.PostLikePublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class PostLikeService {

    private final PostLikePublisher postLikePublisher;

    public void toggleLike(Long postId, PostLikeRequest request){
        // 1. 카프카 이벤트 메시지 전송
        PostLikeEvent event = PostLikeEvent.of(postId, request.userId(), request.isLiked());

        // 2. 퍼블리셔로 카프카 메시지 발송
        postLikePublisher.publisher(event);

        log.debug("[PostLikeService] 카프카 퍼플리셔 메시지 발송: postId {}, userId {}",
                postId, request.userId()
        );
    }
}
