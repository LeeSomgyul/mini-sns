package com.example.backend.repository;

import com.example.backend.entity.UserFollowCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.parameters.P;

import java.util.List;
import java.util.Optional;

public interface UserFollowCacheRepository extends JpaRepository<UserFollowCache, Long> {

    // 팔로우 관계 존재 유무 확인
    Optional<UserFollowCache> findByFollowerIdAndFolloweeId(Long followerId, Long followeeId);

    // 언팔로우 시 DB에서 삭제
    void deleteByFollowerIdAndFolloweeId(Long followerId, Long followeeId);

    // 내가(followerId) 팔로우하는 모든 유저의 id(followeeId) 조회
    List<UserFollowCache> findByFollowerId(Long followerId);

    // 탈퇴자를 팔로우하고 있는 팔로워들의 id 목록 조회
    @Query("""
        SELECT ufc.followerId
        FROM UserFollowCache ufc
        WHERE ufc.followeeId = :userId
    """)
    List<Long> findFollowerIdsByFolloweeId(@Param("userId") Long userId);

    // 탈퇴자가 팔로우하고 있는 유저들을 DB에서 일괄 삭제
    @Modifying(clearAutomatically = true)
    @Query("""
        DELETE
        FROM UserFollowCache ufc
        WHERE ufc.followerId = :userId OR ufc.followeeId = :userId
    """)
    void deleteByFollowerIdOrFolloweeId(@Param("userId") Long userId);
}
