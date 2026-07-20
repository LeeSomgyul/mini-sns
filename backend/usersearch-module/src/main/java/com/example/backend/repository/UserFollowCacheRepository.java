package com.example.backend.repository;

import com.example.backend.entity.UserFollowCache;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserFollowCacheRepository extends JpaRepository<UserFollowCache, Long> {

    // 팔로우 관계 존재 유무 확인
    Optional<UserFollowCache> findByFollowerIdAndFollowingId(Long followerId, Long followeeId);

    // 언팔로우 시 DB에서 삭제
    void deleteByFollowerIdAndFollowingId(Long followerId, Long followeeId);
}
