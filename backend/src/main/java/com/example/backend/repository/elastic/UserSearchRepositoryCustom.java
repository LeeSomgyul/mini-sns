package com.example.backend.repository.elastic;

import com.example.backend.document.UserDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

//[엘라스틱서치] 커스텀 인터페이스
public interface UserSearchRepositoryCustom {

    //[나를 제외한 유저 검색]
    Page<UserDocument> searchUsersNotMe(
            String keyword,//사용자의 검색 값 (이름, 닉네임)
            Long currentUserId,//제외할 id (로그인한 본인)
            Pageable pageable//페이지 끊어서 출력 (프론트에서 1페이지당 20개 요청 예정)
    );
}
