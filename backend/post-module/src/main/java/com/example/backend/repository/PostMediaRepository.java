package com.example.backend.repository;

import com.example.backend.entity.PostMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostMediaRepository extends JpaRepository<PostMedia, Long> {
    Optional<PostMedia> findByPostIdAndMediaType (Long postId, PostMedia.MediaType mediaType);
    Optional<PostMedia> findByPostIdAndMediaTypeAndUniqueId(Long postId, PostMedia.MediaType mediaType, String uniqueId);

    // MiniO 삭제 대상 게시물 ID을 가져오는 메서드
    @Query("""
        SELECT pm
        FROM PostMedia pm JOIN FETCH pm.post
        WHERE pm.post.id IN :postIds
    """)
    List<PostMedia> findByPostIdIn(@Param("postIds") List<Long> postIds);
}
