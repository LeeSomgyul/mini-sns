package com.example.backend.dto;

public record PostTagResponse(
        Long taggedUserId,
        Integer tagOrder
) {
    public static PostTagResponse of(Long taggedUserId, Integer tagOrder){
        return new PostTagResponse(taggedUserId, tagOrder);
    }
}
