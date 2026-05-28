package com.example.backend.domain.search.repository;

import com.example.backend.domain.search.document.UserDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

//[엘라스틱서치] 기본 인터페이스
public interface UserSearchRepository
        extends ElasticsearchRepository<UserDocument, Long>,
        UserSearchRepositoryCustom
{ }
