package com.example.backend.config.kafka;

// [Kafka groupId 저장]
public final class KafkaGroupId {

    private KafkaGroupId(){}

    public static final String GROUP_USER_SEARCH = "minisns-user-search-es";
    public static final String GROUP_USER_PROFILE = "minisns-user-profile";
    public static final String GROUP_USER_CELEBRITY_UPDATE = "minisns-user-celebrity-update";

    public static final String GROUP_POST_MEDIA_COMPLETED = "minisis-post-media-completed";
    public static final String GROUP_POST_CREATE = "minisns-post-create";
    public static final String GROUP_POST_DELETE = "minisns-post-delete";
    public static final String GROUP_POST_HARD_DELETE = "minisns-post-hard-delete";
    public static final String GROUP_POST_USER_UPDATE = "minisns-post-user-update";
    public static final String GROUP_POST_LIKE = "minisns-post-like";
    public static final String GROUP_POST_USER_SOFT_DELETE = "minisns-post-user-soft-delete";

    public static final String GROUP_FEED_POST_CREATE = "minisns-feed-post-create";
    public static final String GROUP_FEED_POST_DELETE = "minisns-feed-post-delete";
    public static final String GROUP_FEED_FOLLOW_UPDATE = "minisns-feed-follow-update";
    public static final String GROUP_FEED_USER_SOFT_DELETE = "minisns-feed-user-soft-delete";

    public static final String GROUP_USERSEARCH_FOLLOW_UPDATE = "minisns-usersearch-follow-update";
    public static final String GROUP_USERSEARCH_USER_SOFT_DELETE = "minisns-usersearch-user-soft-delete";
}
