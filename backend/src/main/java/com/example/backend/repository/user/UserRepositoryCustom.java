package com.example.backend.repository.user;

import com.example.backend.dto.UserSearchResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

//keyword: 사용자의 검색어 (예: '홍길동')
//Pageable: "1페이지에 10명씩 보여줘" 라는 요청 설정
//Page<UserSearchResponse.UserInfo>: "여기 10명의 정보(content)랑 전체 개수 정보야" 라는 결과 묶음
public interface UserRepositoryCustom {
    Page<UserSearchResponse.UserInfo> searchUsersByKeyword(String keyword, Pageable pageable);
}
