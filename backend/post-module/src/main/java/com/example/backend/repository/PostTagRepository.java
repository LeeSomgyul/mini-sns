package com.example.backend.repository;

import com.example.backend.dto.PostTagResponse;
import com.example.backend.entity.PostTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostTagRepository extends JpaRepository<PostTag, Long> {

    // 게시물 삭제 시 관련 태그 id 제거
    @Modifying
    @Query(value = "DELETE FROM post_tags WHERE post_id IN (:postIds)", nativeQuery = true)
    void deleteByPostIdIn(@Param("postIds")List<Long> postIds);

    // 특정 게시물의 모든 태그를 한 번에 삭제
    @Modifying(clearAutomatically = true)
    @Query("""
        DELETE
        FROM PostTag pt
        WHERE pt.post.id = :postId
    """)
    void deleteByPostId(@Param("postId")Long postId);

    // post_tags 테이블에서 post_id로 태그된 사용자를 조회
    // 및 tag_order 순서대로 오름차순 정렬
    @Query("""
        SELECT pt
        FROM PostTag pt
        WHERE pt.post.id = :postId
        ORDER BY pt.tagOrder ASC
    """)
    List<PostTag> findTagsByPostId(@Param("postId") Long postId);
}
