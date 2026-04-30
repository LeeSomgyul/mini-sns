package com.example.backend.dto.user;

import com.example.backend.document.UserDocument;
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
    //Service에서 UserSearchResponse return 덩어리 생성
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

    @Builder
    public record UserInfo(
            Long userId,
            String nickname,
            String name,
            String profileImageUrl
    ){
        //Service에서 UserInfo return 덩어리 생성
        public static UserInfo from (UserDocument userDocument){
            return UserInfo.builder()
                    .userId(userDocument.id())
                    .nickname(userDocument.nickname())
                    .name(userDocument.name())
                    .profileImageUrl(userDocument.profileImageUrl())
                    .build();
        }
    }
}
