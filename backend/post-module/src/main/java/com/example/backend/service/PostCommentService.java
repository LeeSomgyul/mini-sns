package com.example.backend.service;

import com.example.backend.dto.PostCommentRequest;
import com.example.backend.entity.Post;
import com.example.backend.entity.PostComment;
import com.example.backend.entity.UserCache;
import com.example.backend.event.PostCommentCreatedEvent;
import com.example.backend.exception.NotFoundException;
import com.example.backend.repository.PostCommentRepository;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.UserCacheRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PostCommentService {

    private final PostRepository postRepository;
    private final PostCommentRepository postCommentRepository;
    private final UserCacheRepository userCacheRepository;
    private final ApplicationEventPublisher applicationEventPublisher;

    // [댓글 추가]
    // @param postId: 댓글이 달릴 게시물의 id
    // @param authorId: 댓글 작성자 id
    // @param request: 댓글 내용 dto
    // @return id: 댓글 id
    @Transactional
    public Long createComment(Long postId, Long authorId, PostCommentRequest request){
        // 1. 댓글 추가 대상 게시물 존재 여부 확인
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 게시물입니다."));

        // 2. 댓글 작성자가 user_cache 테이블에 존재 여부 확인
        UserCache userCache = userCacheRepository.findById(authorId)
                .orElseThrow(() -> new NotFoundException("캐시데이터가 누락된 사용자입니다."));

        // 3. 댓글 저장
        PostComment postComment = PostComment.builder()
                .post(post)
                .authorId(authorId)
                .content(request.content())
                .build();

        PostComment savedCommentData = postCommentRepository.save(postComment);

        // 4. posts 테이블의 commentCount +1 업데이트
        applicationEventPublisher.publishEvent(new PostCommentCreatedEvent(postId));

        return savedCommentData.getId();
    }
}
