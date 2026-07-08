package com.example.backend.repository;

import com.example.backend.entity.PostComment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostCommentRepository extends JpaRepository<PostComment, Long> {

    // [댓글 목록 조회] 특정 게시물의 댓글 목록을 최신순으로 Slice (무한 스크롤) 조회
    @Query("""
        SELECT c
        FROM PostComment c
        JOIN UserCache u ON c.authorId = u.userId
        WHERE c.post.id = :postId AND (:cursor IS NULL OR c.id < :cursor)
        ORDER BY c.id DESC
    """)
    Slice<PostComment> findCommentsWithSlice(
            @Param("postId") Long postId,
            @Param("cursor") Long cursor,
            Pageable pageable
    );
}
