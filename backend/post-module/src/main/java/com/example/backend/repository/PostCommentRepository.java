package com.example.backend.repository;

import com.example.backend.entity.PostComment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostCommentRepository extends JpaRepository<PostComment, Long> {

    // [댓글 목록 조회] 특정 게시물의 댓글 목록을 최신순으로 Slice (무한 스크롤) 조회
    @Query("""
        SELECT c
        FROM PostComment c
        JOIN UserCache u ON c.authorId = u.userId
        WHERE c.post.id = :postId
            AND u.status = 'ACTIVE'
            AND (:cursor IS NULL OR c.id < :cursor)
        ORDER BY c.id DESC
    """)
    Slice<PostComment> findCommentsWithSlice(
            @Param("postId") Long postId,
            @Param("cursor") Long cursor,
            Pageable pageable
    );

    // [댓글 삭제] post_comments 테이블의 댓글 하드 삭제
    @Modifying(clearAutomatically = true)
    @Query("""
        DELETE
        FROM PostComment c
        WHERE c.id = :commentId
    """)
    int deleteCommentById(@Param("commentId") Long commentId);

    // [댓글 삭제] posts 테이블의 comment_count -1 차감
    @Modifying(clearAutomatically = true)
    @Query("""
        UPDATE Post p
        SET p.commentCount = p.commentCount - 1
        WHERE p.id = :postId AND p.commentCount > 0
    """)
    void decreaseCommentCount(@Param("postId") Long postId);

    // [회원탈퇴 - 하드 삭제]
    // 1. 탈퇴 유저가 일반 유저의 게시물에 달아놓은 댓글 모두 삭제
    @Modifying(clearAutomatically = true)
    @Query("""
        DELETE
        FROM PostComment pc
        WHERE pc.authorId IN :userIds
    """)
    void deleteByUserIdIn(@Param("userIds") List<Long> userIds);

    // 2. 일반 유저가 탈퇴 유저의 게시물에 달아놓은 댓글 모두 삭제
    @Modifying(clearAutomatically = true)
    @Query("""
        DELETE
        FROM PostComment pc
        WHERE pc.post.id IN :postIds
    """)
    void deleteByPostIdIn(@Param("postIds") List<Long> postIds);
}
