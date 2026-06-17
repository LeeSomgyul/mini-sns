package com.example.backend.kafka;

import lombok.Builder;

import java.time.LocalDateTime;

// [실시간 친구 피드 갱신 알림 이벤트 객체]
@Builder
public record NotificationFeedEvent (
        String type, //알림 타입: NEW_POST 또는 CONNECT
        Long receiverUserId, //알림 받아야 하는 친구 대상
        Long triggerUserId, //게시글 작성한 사람의 userId
        Long targerPostId, //새로 생성된 게시글의 id
        LocalDateTime createdAt //발생 시간
){
    public static NotificationFeedEvent of(
            String type,
            Long receiverUserId,
            Long triggerUserId,
            Long targerPostId
    ){
        return NotificationFeedEvent.builder()
                .type(type)
                .receiverUserId(receiverUserId)
                .triggerUserId(triggerUserId)
                .targerPostId(targerPostId)
                .build();
    }
}
