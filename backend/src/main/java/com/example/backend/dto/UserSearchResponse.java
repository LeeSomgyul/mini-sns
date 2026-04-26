package com.example.backend.dto;

import lombok.Builder;
import org.springframework.data.domain.Page;

import java.util.List;

@Builder
public record UserSearchResponse (
        List<UserInfo> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean last
){
    @Builder
    public record UserInfo(
            Long userId,
            String nickname,
            String name,
            String profileImageUrl
    ){}

    //Service에서 return 덩어리 생성
    public static UserSearchResponse from (Page<UserSearchResponse.UserInfo> pageData){
        return UserSearchResponse.builder()
                .content(pageData.getContent())
                .page(pageData.getNumber())
                .size(pageData.getSize())
                .totalElements(pageData.getTotalElements())
                .totalPages(pageData.getTotalPages())
                .last(pageData.isLast())
                .build();
    }
}
