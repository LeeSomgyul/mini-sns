package com.example.backend.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QLocalAccount is a Querydsl query type for LocalAccount
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QLocalAccount extends EntityPathBase<LocalAccount> {

    private static final long serialVersionUID = 1003493826L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QLocalAccount localAccount = new QLocalAccount("localAccount");

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final StringPath email = createString("email");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final DateTimePath<java.time.LocalDateTime> passwordChangedAt = createDateTime("passwordChangedAt", java.time.LocalDateTime.class);

    public final StringPath passwordHash = createString("passwordHash");

    public final QUser user;

    public QLocalAccount(String variable) {
        this(LocalAccount.class, forVariable(variable), INITS);
    }

    public QLocalAccount(Path<? extends LocalAccount> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QLocalAccount(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QLocalAccount(PathMetadata metadata, PathInits inits) {
        this(LocalAccount.class, metadata, inits);
    }

    public QLocalAccount(Class<? extends LocalAccount> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.user = inits.isInitialized("user") ? new QUser(forProperty("user")) : null;
    }

}

