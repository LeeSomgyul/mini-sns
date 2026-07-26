package com.example.backend.repository;

import com.example.backend.entity.Post;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PostRepository  extends JpaRepository<Post, Long> {

    // [게시물 + 게시물의 미디어 파일을 한번에 가져오는 코드]
    @Query("""
        SELECT DISTINCT p 
        FROM Post p 
        LEFT JOIN FETCH p.mediaList 
        JOIN UserCache u ON p.authorId = u.userId
        WHERE p.id IN :postIds
            AND u.status = 'ACTIVE'
    """)
    List<Post> findPostsWithAuthorAndMediaByIdIn(@Param("postIds") List<Long> postIds);


    // [일정 기간(baselineDate) 이전의 데이터를 DB에서 실제 삭제]
    // - Post 엔티티의 @SQLRestriction 사용으로 인해 JPA가 아닌 일반 SQL문을 사용해야 함.
    @Query(
            value = "SELECT * FROM posts WHERE status = 'DELETED' AND deleted_at <= :baselineDate",
            nativeQuery = true
    )
    Slice<Post> findPostsToHardDelete(
            @Param("baselineDate")LocalDateTime baselineDate,
            Pageable pageable
    );

    // [데이터베이스에서 게시물을 실제 하드 삭제]
    @Modifying(clearAutomatically = true)
    @Query(value = "DELETE FROM posts WHERE id IN (:postIds)", nativeQuery = true)
    void hardDeleteByIdIn(@Param("postIds") List<Long> postIds);

    // [게시물 존재 확인]
    @Query("select p from Post p " +
            "left join fetch p.mediaList " +
            "where p.id = :postId and p.status != 'DELETED'")
    Optional<Post> findByPostWithMedia(@Param("postId") Long postId);

    // [게시물 작성자(authorId) 기준으로 게시물 개수 확인]
    long countByAuthorId(Long authorId);

    // [댓글 개수 +1]
    @Modifying(clearAutomatically = true)
    @Query("""
        UPDATE Post p
        SET p.commentCount = p.commentCount + 1
        WHERE p.id = :postId
        """)
    void incrementCommentCount(@Param("postId") Long postId);

    // [회원탈퇴 - 하드 삭제]
    // 1. 소프트 삭제 30일이 경과된 탈퇴자의 게시물 id slice 목록 조회
    @Query("""
        SELECT p.id
        FROM Post p
        WHERE p.authorId IN :userIds
    """)
    List<Long> findPostIdsByAuthorIdIn(@Param("userIds") List<Long> userIds);

    // 2. 게시글 삭제 (본인 post, comment, like, tag, media 포함)
    @Modifying(clearAutomatically = true)
    @Query("""
        DELETE
        FROM Post p
        WHERE p.authorId IN :userIds
    """)
    void deleteByAuthorIdIn(@Param("userIds") List<Long> userIds);
}
