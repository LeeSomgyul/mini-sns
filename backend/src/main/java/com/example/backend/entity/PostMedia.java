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

    //[enum]
    public enum MediaType{
        IMAGE, VIDEO
    }

    //[빌더]
    @Builder
    public PostMedia(Post post, MediaType mediaType, String url, String thumbnailUrl, String cropState, int sortOrder){
        this.post = post;
        this.mediaType = mediaType;
        this.url = url;
        this.thumbnailUrl = thumbnailUrl;
        this.cropState = cropState;
        this.sortOrder = sortOrder;
    }

    //[메서드] 썸네일 업데이트 저장
    public void updateThumbnailUrl(String thumbnailUrl){
        this.thumbnailUrl = thumbnailUrl;
    }

    //[메서드] Go워커 가공 완료 후 실행
    // 1.DB의 .mp4 원본 경로를 .m3u8 지도로 교체
    // 2.Go 워커에서 생성된 썸네일 경로를 업데이트
    public void updateReplaceVideo(String m3u8URL, String thumbnailUrl){
        if(this.mediaType != MediaType.VIDEO){
            throw new IllegalStateException("비디오 타입의 미디어만 인코딩 결과를 반영할 수 있습니다.");
        }
        this.url = m3u8URL;
        this.thumbnailUrl = thumbnailUrl;
    }
}
