package com.example.backend.repository.elastic;

import com.example.backend.document.UserDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import org.springframework.data.domain.Pageable;

//[엘라스틱서치] 사용자 검색
public interface UserSearchRepository extends ElasticsearchRepository<UserDocument, Long> {

    //nickname, name으로 데이터 찾기
    //pageable: 페이지 끊어서 출력 (프론트에서 1페이지당 20개 요청 예정)
    Page<UserDocument> findByNicknameOrName (String nickname, String name, Pageable pageable);
}
