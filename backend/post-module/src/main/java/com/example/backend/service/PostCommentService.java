package com.example.backend.service;

import com.example.backend.dto.PostCommentRequest;
import com.example.backend.dto.PostCommentResponse;
import com.example.backend.entity.Post;
import com.example.backend.entity.PostComment;
import com.example.backend.entity.UserCache;
import com.example.backend.event.PostCommentCreatedEvent;
import com.example.backend.exception.NotFoundException;
import com.example.backend.exception.UnauthorizedException;
import com.example.backend.repository.PostCommentRepository;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.UserCacheRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.example.backend.dto.PostCommentResponse.*;
import static com.example.backend.dto.PostCommentResponse.CommentContentResponse.*;

import java.util.List;

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
        userCacheRepository.findById(authorId)
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

    // [특정 게시물의 댓글 목록 조회]
    // @param postId: 댓글이 소속되어 있는 게시물 id
    // @param cursor: 몇번째 댓글까지 확인했는지 (마지막으로 응답한 댓글 id)
    // @param size: 한번에 응답 할 댓글 개수
    // @param currentUserId: 현재 로그인한 사용자 id
    // @return PostCommentResponse: 댓글 조회 최종 응답 (댓글 내용, 다음 게시물 커서, 다음 페이지 존재 여부)
    public PostCommentResponse getComments(Long postId, Long cursor, int size, Long currentUserId){
        // 1. 무한 스크롤을 위해 페이징 조립
        // - 0: 몇 번째 페이지부터 댓글 조회 시작할 것인지?
        // - size: 한 페이지 당 데이터를 최대 몇 개씩 묶어서 가져올 것인가?
        PageRequest pageRequest = PageRequest.of(0, size);

        // 2. 특정 게시물의 댓글을 Slice 하여 가져오기
        Slice<PostComment> commentSlice = postCommentRepository.findCommentsWithSlice(postId, cursor, pageRequest);

        // 3. 프론트 응답을 위한 DTO 조립
        List<CommentContentResponse> contentDto = commentSlice.getContent().stream()
                .map(comment -> {
                    // 각 댓글의 사용자 정보 조립
                    UserCache userCache = userCacheRepository.findByUserId(comment.getAuthorId())
                            .orElse(null);

                    String nickname = (userCache != null) ? userCache.getNickname() : "알 수 없는 사용자";
                    String profileUrl = (userCache != null) ? userCache.getProfileImageUrl() : null;

                    CommentAuthorResponse authorDto = CommentAuthorResponse.of(
                            comment.getAuthorId(),
                            nickname,
                            profileUrl
                    );

                    // 내가 (로그인한 사용자 본인) 작성한 댓글인지 확인
                    boolean isMine = currentUserId != null && currentUserId.equals(comment.getAuthorId());

                    // 프론트 응답 전송
                    return CommentContentResponse.of(
                            comment.getId(),
                            authorDto,
                            comment.getContent(),
                            comment.getCreatedAt(),
                            isMine,
                            false
                    );
                })
                .toList();

        // 4. 다음 페이지 스크롤을 위한 페이지 정보 출력
        Long nextCursor = null;
        if(commentSlice.hasNext() && !contentDto.isEmpty()){
            nextCursor = contentDto.get(contentDto.size() - 1).commentId();
        }

        return PostCommentResponse.of(contentDto, nextCursor, commentSlice.hasNext());
    }

    // [댓글 하드 삭제 & 게시글 수 차감]
    // @param commentId: 삭제 대상 댓글 id
    // @param currentUserId: 현재 로그인한 사용자의 id
    @Transactional
    public void deleteComment(Long commentId, Long currentUserId){
        // 1. [검증] 삭제 대상 댓글이 DB에 실제 존재하는지 확인
        PostComment comment = postCommentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException("존재하지 않거나 이미 삭제된 댓글입니다."));

        // 2. [검증] 댓글 삭제 요청한 사용자가 해당 댓글 작성자인지 확인
        if(!comment.getAuthorId().equals(currentUserId)){
            throw new UnauthorizedException("삭제 권한이 없습니다.");
        }

        // 3. 게시글 수 차감에 사용할 postId 가져오기
        Long postId = comment.getPost().getId();

        // 4. DB에서 댓글 하드 삭제 실행
        int deletedRows = postCommentRepository.deleteCommentById(commentId);

        // 5. [검증] 동시에 다른 기기에서 이미 지운 경우 확인
        if(deletedRows == 0){
            throw new NotFoundException("이미 삭제된 댓글입니다.");
        }

        // 6. posts 테이블의 게시글 개수 -1 차감
        postCommentRepository.decreaseCommentCount(postId);
    }

    // [댓글 수정]
    // @param commentId: 수정 대상 댓글 id
    // @param currentUserId: 현재 로그인한 사용자의 id
    // @param request: 수정된 댓글 내용 dto
    @Transactional
    public CommentContentResponse updateComment(Long commentId, Long currentUserId, PostCommentRequest request){
        // 1. [검증] 댓글이 DB에 존재하는지 여부 확인
        PostComment comment = postCommentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException("존재하지 않거나 이미 삭제된 댓글입니다."));

        // 2. [검증] 댓글 수정 요청한 사용자가 해당 댓글 작성자인지 확인
        if(!comment.getAuthorId().equals(currentUserId)){
            throw new UnauthorizedException("수정 권한이 없습니다.");
        }

        // 3. [검증] 댓글 작성자가 user_cache 테이블에 존재 여부 확인
        UserCache userCache = userCacheRepository.findById(comment.getAuthorId())
                .orElseThrow(() -> new NotFoundException("캐시데이터가 누락된 사용자입니다."));

        // 4. 댓글 수정
        comment.updateContent(request.content());

        return CommentContentResponse.of(
                comment.getId(),
                CommentAuthorResponse.of(
                        userCache.getUserId(),
                        userCache.getNickname(),
                        userCache.getProfileImageUrl()
                ),
                comment.getContent(),
                comment.getCreatedAt(),
                true,
                true
        );
    }
}
