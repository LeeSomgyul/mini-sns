package com.example.backend.config.kafka;

// [Kafka groupId 저장]
public final class KafkaGroupId {

    private KafkaGroupId(){}

    public static final String GROUP_USER_SEARCH = "minisns-user-search-es";
    public static final String GROUP_USER_PROFILE = "minisns-user-profile";

    public static final String GROUP_POST_MEDIA_COMPLETED = "minisis-post-media-completed";
    public static final String GROUP_POST_CREATE = "minisns-post-create";
    public static final String GROUP_POST_DELETE = "minisns-post-delete";
    public static final String GROUP_POST_HARD_DELETE = "minisns-post-hard-delete";
    public static final String GROUP_POST_USER_UPDATE = "minisns-post-user-update";
    public static final String GROUP_POST_LIKE = "minisns-post-like";

    public static final String GROUP_FEED_POST_CREATE = "minisns-feed-post-create";
    public static final String GROUP_FEED_POST_DELETE = "minisns-feed-post-delete";
}
