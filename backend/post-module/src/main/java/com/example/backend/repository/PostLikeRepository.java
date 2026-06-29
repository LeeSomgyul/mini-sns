package com.example.backend.repository;

import com.example.backend.entity.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    // [특정 유저가 특정 게시물에 좋아요 눌렀는지 확인 후 PostLike에 맞는 데이터 가져오기]
    Optional<PostLike> findByPostIdAndUserId(Long postId, Long userId);

    // [특정 유저가 '좋아요'를 누른 한 페이지(20개)의 postId 가져오기]
    @Query("""
        SELECT pl.post.id
        FROM PostLike pl
        WHERE pl.userId = :userId
            AND pl.post.id IN :postIds
    """)
    List<Long> findLikedPostIdsByUserId(
            @Param("userId") Long userId,
            @Param("postIds") List<Long> postIds
    );
}
