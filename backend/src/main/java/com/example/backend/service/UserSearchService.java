package com.example.backend.service;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.UserSearchResponse;
import com.example.backend.exception.InvalidRequestException;
import com.example.backend.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserSearchService {

    private final UserRepository userRepository;

    //keyword: 사용자의 검색어 (예: '홍길동')
    //Pageable: "1페이지에 10명씩 보여줘" 라는 요청 설정
    public UserSearchResponse searchUsers(String keyword, Pageable pageable){

        //검색어가 없거나, 1글자 이하인 경우
        if(keyword == null || keyword.trim().length() < 2){
            throw new InvalidRequestException("검색어를 2자 이상 입력해주세요.");
        }

        Page<UserSearchResponse.UserInfo> resultPage = userRepository.searchUsersByKeyword(keyword.trim(), pageable);

        return UserSearchResponse.from(resultPage);
    }
}
