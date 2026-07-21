package com.example.backend.dto;

import com.example.backend.document.UserDocument;

import java.util.List;

public record TagUserSearchResponse(
        List<UserSearchDto> content,    // 검색 결과 리스트
        boolean hasNextPage,            // 다음 페이지 존재 여부
        List<Object> nextSearchAfter    // 다음 페이지 요청 시 넘겨줄 search_after 커서 값 (엘라스틱서치 전용)
) {
    public static TagUserSearchResponse of (List<UserSearchDto> content, boolean hasNextPage, List<Object> nextSearchAfter){
        return new TagUserSearchResponse( content, hasNextPage, nextSearchAfter);
    }

    public record UserSearchDto(
            Long userId,
            String nickname,
            String name,
            String profileImageUrl
    ){
        public static UserSearchDto from(UserDocument document){
            return new UserSearchDto(
                    document.id(),
                    document.nickname(),
                    document.name(),
                    document.profileImageUrl()
            );
        }
    }
}
