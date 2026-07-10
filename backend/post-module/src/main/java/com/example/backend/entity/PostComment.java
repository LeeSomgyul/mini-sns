package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Getter
@Table(
        name = "post_comments",
        indexes = {
                // 인덱스: 특정 게시물의 최신 댓글 조회
                @Index(name = "idx_post_comments_post_created", columnList = "post_id, created_at DESC")
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class PostComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(name = "author_id", nullable = false)
    private Long authorId;

    @Column(name = "content", nullable = false, length = 900)
    private String content;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;


    @Builder
    public PostComment(Post post, Long authorId, String content){
        this.post = post;
        this.authorId = authorId;
        this.content = content;
    }

    // [댓글 수정]
    public void updateContent(String newContent){
        if(newContent == null || newContent.isBlank()){
            throw new IllegalArgumentException("잘못된 댓글 내용입니다.");
        }

        this.content = newContent;
    }
}
