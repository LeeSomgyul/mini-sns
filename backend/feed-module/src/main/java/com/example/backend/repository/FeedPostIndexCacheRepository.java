package com.example.backend.repository;

import com.example.backend.entity.FeedPostIndexCache;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface FeedPostIndexCacheRepository extends JpaRepository<FeedPostIndexCache, Long> {

    // [인덱스 전용 조회 쿼리]
    // 내가 팔로우하는 작성자들의 최근 게시글 ID 리스트를 Pageable 크기만큼 가져옵니다.
    @Query("""
        SELECT f.postId 
        FROM FeedPostIndexCache f 
        WHERE f.authorId IN :authorIds 
        ORDER BY f.createdAt DESC
    """)
    List<Long> findRecentPostIdsByAuthorIds(
            @Param("authorIds") List<Long> authorIds,
            Pageable pageable
    );

    // 내가 팔로우하는 인플루언서의 postId 가져오기
    @Query("""
        SELECT f.postId 
        FROM FeedPostIndexCache f 
        WHERE f.authorId IN :authorIds 
          AND (:cursorId IS NULL OR f.postId < :cursorId)
        ORDER BY f.postId DESC
    """)
    List<Long> findCelebrityPostIdsWithCursor(
            @Param("authorIds") List<Long> authorIds,
            @Param("cursorId") Long cursorId,
            Pageable pageable
    );
}
