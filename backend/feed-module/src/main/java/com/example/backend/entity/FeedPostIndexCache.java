package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

// [웜업 시 특정 작성자들의 최신 글을 빠르게 가져오기 위한 인덱스]
// - FeedWarmUpComponent에서 사용
@Entity
@Table(name = "feed_post_index_cache", indexes = {
    @Index(
            name = "idx_author_created",
            columnList = "author_id, created_at DESC"
    )
})
@Getter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
public class FeedPostIndexCache {
    @Id
    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(name = "author_id", nullable = false)
    private Long authorId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
