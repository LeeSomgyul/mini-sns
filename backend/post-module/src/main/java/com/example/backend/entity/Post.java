package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Table(
        name = "posts",
        indexes = {
                @Index(name = "idx_post_status_deleted_at", columnList = "status, deletedAt")
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
@SQLRestriction("status = 'PUBLIC'")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "author_id", nullable = false)
    private Long authorId;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "thumbnail_url", columnDefinition = "TEXT")
    private String thumbnailUrl;

    @Column(name = "comment_count", nullable = false)
    private int commentCount = 0;

    @Column(name = "like_count", nullable = false)
    private int likeCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostStatus status = PostStatus.PUBLIC;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostMedia> mediaList = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostTag> tags = new ArrayList<>();

    //---enum---
    public enum PostStatus{
        PUBLIC, DELETED
    }

    //---빌더---
    @Builder
    public Post(Long authorId, String content){
        this.authorId = authorId;
        this.content = content;
    }

    //--메서드--
    public void addTag(PostTag tag){
        this.tags.add(tag);
    }

    public void updateThumbnailUrl(String thumbnailUrl){
        this.thumbnailUrl = thumbnailUrl;
    }

    // 소프트 삭제 메서드
    public void softDelete(){
        this.status = PostStatus.DELETED;
        this.deletedAt = LocalDateTime.now();
    }

    // 이미 삭제된 게시물인지 확인하는 메서드
    public boolean isDeleted(){
        return this.status == PostStatus.DELETED;
    }

    // 게시물의 게시글 업데이트 메서드
    public void updateContent(String content){
        this.content = content;
        this.updatedAt = LocalDateTime.now();
    }
}
