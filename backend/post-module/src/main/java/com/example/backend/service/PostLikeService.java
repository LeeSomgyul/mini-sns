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

    // 1. 좋아요 등록
    public void addLike(Long postId, PostLikeRequest request){
        PostLikeEvent event = PostLikeEvent.of(postId, request.userId(), true);
        postLikePublisher.publisher(event);
    }

    // 2. 좋아요 취소
    public void cancelLike(Long postId, PostLikeRequest request){
        PostLikeEvent event = PostLikeEvent.of(postId, request.userId(), false);
        postLikePublisher.publisher(event);
    }
}
