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

    @Query("""
        SELECT DISTINCT p 
        FROM Post p 
        LEFT JOIN FETCH p.mediaList 
        WHERE p.id IN :postIds
    """)
    List<Post> findPostsWithAuthorAndMediaByIdIn(@Param("postIds") List<Long> postIds);


    // 일정 기간(baselineDate) 이전의 데이터를 DB에서 실제 삭제
    // - Post 엔티티의 @SQLRestriction 사용으로 인해 JPA가 아닌 일반 SQL문을 사용해야 함.
    @Query(
            value = "SELECT * FROM posts WHERE status = 'DELETED' AND deleted_at <= :baselineDate",
            nativeQuery = true
    )
    Slice<Post> findPostsToHardDelete(
            @Param("baselineDate")LocalDateTime baselineDate,
            Pageable pageable
    );

    @Modifying(clearAutomatically = true)
    @Query(value = "DELETE FROM posts WHERE id IN (:postIds)", nativeQuery = true)
    void hardDeleteByIdIn(@Param("postIds") List<Long> postIds);

    // 게시물 존재 확인
    @Query("select p from Post p " +
            "left join fetch p.mediaList " +
            "where p.id = :postId and p.status != 'DELETED'")
    Optional<Post> findByPostWithMedia(@Param("postId") Long postId);

    // 게시물 작성자(authorId) 기준으로 게시물 개수 확인
    long countByAuthorId(Long authorId);


//🔥카프카 연동 후 수정
//    //[인플루언서 사용자의 글만 추출]
//    /*
//    * 일반 사용자가 피드를 열 때, Redis에 저장되지 않은 인플루언서의 글을 DB에서 실시간으로 가져오기 위해 사용.
//    * @Param authorIds: 게시물을 작성한 인플루언서 사용자 ID
//    * @Param cursorId: 다음 페이지 요청(무한 스크롤)을 위해 어디까지 봤는지 게시물의 postId
//    * @Param pageable: 한 페이지 당 몇개의 게시물을 가져올 것인지
//    * @Query 특정 인플루언서가 작성한 글 중에서, 내가 마지막으로 본 글보다 더 과거의 글을 최신순으로 가져오기
//    */
//    @Query(
//            "SELECT p FROM Post p " +
//            "WHERE p.author.id IN :authorIds " +
//            "AND p.author.isCelebrity = true " +
//            "AND (:cursorId IS NULL OR p.id < :cursorId) " +
//            "ORDER BY p.id DESC"
//    )
//    List<Post> findCelebrityPosts(
//        @Param("authorIds") List<Long> authorIds,
//        @Param("cursorId") Long cursorId,
//        Pageable pageable
//    );
}
