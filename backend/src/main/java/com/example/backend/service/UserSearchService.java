package com.example.backend.service;

import com.example.backend.document.UserDocument;
import com.example.backend.dto.UserSearchResponse;
import com.example.backend.exception.InvalidRequestException;
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
    //Pageable: "1페이지에 10명씩 보여줘" 라는 요청 설정
    public UserSearchResponse searchUsers(String keyword, Pageable pageable){

        //검색어가 없거나, 1글자 이하인 경우
        if(keyword == null || keyword.trim().length() < 2){
            throw new InvalidRequestException("검색어를 2자 이상 입력해주세요.");
        }

        //엘라스틱서치에서 찾기
        Page<UserDocument> documentPage = userSearchRepository.findByNicknameOrName(
                keyword.trim(),
                keyword.trim(),
                pageable
        );

        //엘라스틱서치의 결과를 프론트엔드가 원하는 응답 형식으로 변환
        Page<UserSearchResponse.UserInfo> resultPage = documentPage.map(doc ->
                UserSearchResponse.UserInfo.builder()
                        .userId(doc.getId())
                        .nickname(doc.getNickname())
                        .name(doc.getName())
                        .profileImageUrl(doc.getProfileImageUrl())
                        .build()
        );

        return UserSearchResponse.from(resultPage);
    }
}
