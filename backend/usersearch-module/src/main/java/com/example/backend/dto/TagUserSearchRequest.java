package com.example.backend.dto;

import java.util.List;

// [엘라스틱 서치의 Search After Cursor 사용]
public record TagUserSearchRequest(
        String keyword,             // 프론트엔드에서의 입력값 (이름, 닉네임 검색어)
        List<Object> searchAfter,   // 어디서부터 값을 가져올 것인지 (첫 요청 시 null)
        Integer size                // 한번에 가져올 개수
) {
    public TagUserSearchRequest{
        if(size == null || size <= 0){
            size = 10; // 기본값 10개
        }
    }
}
