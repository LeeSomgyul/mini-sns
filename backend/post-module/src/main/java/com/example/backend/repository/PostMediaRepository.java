package com.example.backend.repository;

import com.example.backend.entity.PostMedia;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostMediaRepository extends JpaRepository<PostMedia, Long> {

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
        FROM PostMedia pm
        JOIN pm.post p
        JOIN UserCache u ON p.authorId = u.userId
        WHERE p.authorId = :userId
            AND pm.sortOrder = 0
            AND u.status = 'ACTIVE'
        ORDER BY p.createdAt DESC
    """)
    Slice<PostMedia> findTopMediaByUserId(@Param("userId") Long userId, Pageable pageable);

    // [회원탈퇴 - 하드 삭제]
    // 1. 하드 삭제 하기 전에 MiniO 경로를 미리 추출 (db날아가면 minio에서 지울때 경로 못찾으니까)
    @Query("""
        SELECT pm.url
        FROM PostMedia pm
        WHERE pm.post.id = :postIds
    """)
    List<String> findMediaUrlsByPostIdIn(@Param("postIds") List<Long> postIds);

    // 2. DB에서 미디어 삭제
    @Modifying(clearAutomatically = true)
    @Query("""
        DELETE
        FROM PostMedia pm
        WHERE pm.post.id IN :postIds
    """)
    void deleteByPostIdIn(List<Long> postIds);
}
