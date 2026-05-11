package com.example.backend.service;

import com.example.backend.document.UserDocument;
import com.example.backend.dto.user.UserSearchResponse;
import com.example.backend.repository.elastic.UserSearchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserSearchService {

    private final UserSearchRepository userSearchRepository;

    //keyword: 사용자의 검색어 (예: '홍길동')
    //currentUserId: 현재 로그인한 사용자 본인 id
    //Pageable: "1페이지에 10명씩 보여줘" 라는 요청 설정
    public UserSearchResponse searchUsers(String keyword, Long currentUserId,Pageable pageable){

        //엘라스틱서치에서 찾기
        Page<UserDocument> documentPage = userSearchRepository.searchUsersNotMe(
                keyword.trim(),
                currentUserId,
                pageable
        );

        //엘라스틱서치의 결과를 프론트엔드가 원하는 응답 형식으로 변환
        Page<UserSearchResponse.UserInfo> resultPage = documentPage
                .map(UserSearchResponse.UserInfo::from);

        return UserSearchResponse.from(resultPage);
    }
}
