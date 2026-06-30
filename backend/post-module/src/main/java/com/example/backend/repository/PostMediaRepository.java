package com.example.backend.repository;

import com.example.backend.entity.PostMedia;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostMediaRepository extends JpaRepository<PostMedia, Long> {
    Optional<PostMedia> findByPostIdAndMediaType (Long postId, PostMedia.MediaType mediaType);
    Optional<PostMedia> findByPostIdAndMediaTypeAndUniqueId(Long postId, PostMedia.MediaType mediaType, String uniqueId);

    // MiniO 삭제 대상 게시물 ID을 가져오는 메서드
    @Query(value = "SELECT * FROM post_media WHERE post_id IN (:postIds)", nativeQuery = true)
    List<PostMedia> findByPostIdIn(@Param("postIds") List<Long> postIds);

    // postId로 media 삭제
    @Modifying(clearAutomatically = true)
    @Query(value = "DELETE FROM post_media WHERE post_id IN (:postIds)", nativeQuery = true)
    void hardDeleteByPostIdIn(@Param("postIds") List<Long> postIds);

    // userId로, sortOrder가 0번째인 게시물에 대한 게시물 생성일 최신순으로 가져오기
    @Query("""
        SELECT pm
        FROM PostMedia pm JOIN pm.post p
        WHERE p.authorId = :userId AND pm.sortOrder = 0
        ORDER BY p.createdAt DESC
    """)
    List<PostMedia> findTopMediaByUserId(@Param("userId") Long userId, Pageable pageable);
}
