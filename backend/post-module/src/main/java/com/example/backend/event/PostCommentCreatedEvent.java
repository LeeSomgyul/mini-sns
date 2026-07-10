package com.example.backend.event;

// [댓글 작성 완료 시 발생할 이벤트]
// postId: 댓글이 달린 게시물 id
public record PostCommentCreatedEvent(Long postId) {
}
