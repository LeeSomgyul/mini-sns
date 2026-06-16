package com.example.backend.kafka.media;

import lombok.Builder;

//[kafka 작업지시서]: 아래 값들을 워커에 전달
@Builder
public record MediaProcessEvent (
        Long postId,//영상이 소속된 게시물 id?
        String videoKey,//처리해야할 영상이 minio 어디에 있는지?
        String originalFileName//이 영상의 원본 이름?
){
    public static MediaProcessEvent of (Long postId, String videoKey, String originalFileName){
        return new MediaProcessEvent(postId,videoKey,originalFileName);
    }
}
