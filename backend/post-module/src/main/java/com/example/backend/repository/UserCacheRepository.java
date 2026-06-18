package com.example.backend.repository;

import com.example.backend.entity.UserCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserCacheRepository extends JpaRepository<UserCache, Long> {

    // 글쓴이(authorId)를 제외한 모든 캐시된 유저의 id만 리스트로 추출
    @Query("""
        SELECT u.id\s
        FROM UserCache u\s
        WHERE u.id != :actorId
        """)
    List<Long> findAllIdsExcept(@Param("actorId")Long actorId);
}
