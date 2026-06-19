package com.example.backend.repository;

import com.example.backend.document.UserDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

//[엘라스틱서치] 기본 인터페이스
// - 스프링이 엘라스틱서치 전용으로 만들어둔 규격 (자동으로 save 등의 메서드 사용 가능)
public interface UserSearchRepository
        extends ElasticsearchRepository<UserDocument, Long>,
        UserSearchRepositoryCustom
{ }
