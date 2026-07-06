package com.example.backend.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QPost is a Querydsl query type for Post
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QPost extends EntityPathBase<Post> {

    private static final long serialVersionUID = -258535904L;

    public static final QPost post = new QPost("post");

    public final NumberPath<Long> authorId = createNumber("authorId", Long.class);

    public final NumberPath<Long> commentCount = createNumber("commentCount", Long.class);

    public final StringPath content = createString("content");

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final DateTimePath<java.time.LocalDateTime> deletedAt = createDateTime("deletedAt", java.time.LocalDateTime.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final NumberPath<Long> likeCount = createNumber("likeCount", Long.class);

    public final ListPath<PostMedia, QPostMedia> mediaList = this.<PostMedia, QPostMedia>createList("mediaList", PostMedia.class, QPostMedia.class, PathInits.DIRECT2);

    public final EnumPath<Post.PostStatus> status = createEnum("status", Post.PostStatus.class);

    public final ListPath<PostTag, QPostTag> tags = this.<PostTag, QPostTag>createList("tags", PostTag.class, QPostTag.class, PathInits.DIRECT2);

    public final StringPath thumbnailUrl = createString("thumbnailUrl");

    public final DateTimePath<java.time.LocalDateTime> updatedAt = createDateTime("updatedAt", java.time.LocalDateTime.class);

    public QPost(String variable) {
        super(Post.class, forVariable(variable));
    }

    public QPost(Path<? extends Post> path) {
        super(path.getType(), path.getMetadata());
    }

    public QPost(PathMetadata metadata) {
        super(Post.class, metadata);
    }

}

