package com.example.backend.infrastructure.kafka.feed;

import lombok.Builder;

// [피드 Push 이벤트] 게시글 작성 시 카프카를 통해 비동기로 전달되는 메시지 지시서
/*
* @param postId: 새로 생성된 게시글 ID
* @param authorId: 게시글 작성자 ID
*/
@Builder
public record FeedPushEvent(
        Long postId,
        Long authorId
){
    public static FeedPushEvent of(Long postId, Long authorId){
        return new FeedPushEvent(postId, authorId);
    }
}
