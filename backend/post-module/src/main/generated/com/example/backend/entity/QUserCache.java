package com.example.backend.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;


/**
 * QUserCache is a Querydsl query type for UserCache
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QUserCache extends EntityPathBase<UserCache> {

    private static final long serialVersionUID = -1863027465L;

    public static final QUserCache userCache = new QUserCache("userCache");

    public final StringPath nickname = createString("nickname");

    public final StringPath profileImageUrl = createString("profileImageUrl");

    public final StringPath status = createString("status");

    public final NumberPath<Long> userId = createNumber("userId", Long.class);

    public QUserCache(String variable) {
        super(UserCache.class, forVariable(variable));
    }

    public QUserCache(Path<? extends UserCache> path) {
        super(path.getType(), path.getMetadata());
    }

    public QUserCache(PathMetadata metadata) {
        super(UserCache.class, metadata);
    }

}

