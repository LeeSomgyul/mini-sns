package com.example.backend.kafka;

import java.util.List;

// [MiniO에 저장된 데이터 제거를 위한 이벤트]
public record PostHardDeletedEvent(
        Long postId,
        List<String> targetObjectPaths //MiniO에서 지워야 할 경로+파일명
) {
    public static PostHardDeletedEvent of(Long postId, List<String> targetObjectPaths){
        return new PostHardDeletedEvent(postId, targetObjectPaths);
    }
}
