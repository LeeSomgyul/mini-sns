package com.example.backend.config.kafka;

// [Kafka groupId 저장]
public final class KafkaGroupId {

    private KafkaGroupId(){}

    public static final String GROUP_USER_SEARCH = "minisns-user-search-es";

    public static final String GROUP_POST_MEDIA_COMPLETED = "minisis-post-media-completed";
    public static final String GROUP_POST_CREATE = "minisns-post-create";
    public static final String GROUP_POST_SOFT_DELETE = "minisns-post-soft-delete";
    public static final String GROUP_POST_HARD_DELETE = "minisns-post-hard-delete";
    public static final String GROUP_POST_USER_UPDATE = "minisns-post-user-update";

}
