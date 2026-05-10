package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "post_media")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class PostMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false)
    private MediaType mediaType;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String url;

    @Column(name = "thumbnail_url", columnDefinition = "TEXT")
    private String thumbnailUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "crop_state", columnDefinition = "jsonb")
    private String cropState;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    //---enum---
    public enum MediaType{
        IMAGE, VIDEO
    }

    //---빌더---
    @Builder
    public PostMedia(Post post, MediaType mediaType, String url, String thumbnailUrl, String cropState, int sortOrder){
        this.post = post;
        this.mediaType = mediaType;
        this.url = url;
        this.thumbnailUrl = thumbnailUrl;
        this.cropState = cropState;
        this.sortOrder = sortOrder;
    }

    //---저장 메서드---
    public void updateThumbnailUrl(String thumbnailUrl){
        this.thumbnailUrl = thumbnailUrl;
    }
}
