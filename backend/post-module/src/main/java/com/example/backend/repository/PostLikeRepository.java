package com.example.backend.repository;

import com.example.backend.entity.Post;
import com.example.backend.entity.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    // 특정 유저가 특정 게시물에 좋아요를 눌렀는지 여부를 확인.
    @Query("""
        SELECT COUNT(pl) > 0
        FROM PostLike pl
        JOIN pl.post p
        WHERE p.id = :postId
            AND pl.userId = :userId
    """)
    boolean existsByPostIdAndUserId(@Param("postId") Long postId, @Param("userId") Long userId);


}
