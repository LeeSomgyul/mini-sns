package com.example.backend.repository;

import com.example.backend.entity.PostTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostTageRepository extends JpaRepository<PostTag, Long> {

    // 게시물 삭제 시 관련 태그 id 제거
    @Modifying
    @Query("""
        DELETE
        FROM PostTag p
        WHERE p.post.id IN :postIds
    """)
    void deleteByPostIdIn(@Param("postIds")List<Long> postIds);
}
