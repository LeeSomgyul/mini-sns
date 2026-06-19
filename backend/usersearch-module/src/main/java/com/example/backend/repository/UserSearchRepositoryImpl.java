package com.example.backend.repository;

import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch._types.query_dsl.QueryBuilders;
import com.example.backend.document.UserDocument;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.stream.Collectors;

//[엘라스틱서치] 기본 인터페이스 + 커스텀 인터페이스 한번에 사용할 수 있도록 합체
@Slf4j
@Repository
@RequiredArgsConstructor
public class UserSearchRepositoryImpl implements UserSearchRepositoryCustom{

    public final ElasticsearchOperations elasticsearchOperations;

    //닉네임 or 이름으로 검색, 본인 제외
    @Override
    public Page<UserDocument> searchUsersNotMe(String keyword, Long currentUserId, Pageable pageable) {

        //QueryBuilders: 커스텀 쿼리 만들때 선언
        Query query = QueryBuilders.bool(b -> b
                //검색 조건: 아래 should(닉네임, 이름) 둘 중 하나는 무조건 일치해야 함
                .minimumShouldMatch("1")
                .should(s -> s.match(m -> m.field("nickname").query(keyword)))
                .should(s -> s.match(m -> m.field("name").query(keyword)))
                //제외 조건: 내 id는 무조건 검색에서 제외
                .mustNot(mn -> mn.term(t -> t.field("id").value(currentUserId)))
        );

        //엘라스틱 서치가 이해할 수 있는 검색 요청 빌더(객체) 생성
        NativeQuery nativeQuery = NativeQuery.builder()
                .withQuery(query)
                .withPageable(pageable)
                .build();

        //엘라스틱 서치에게 검색 요청
        //nativeQuery: 무엇을 찾을지
        //UserDocument.class: 엘라스틱 서치 결과물인 JSON 데이터를 UserDocument 객체 형식으로 전환
        SearchHits<UserDocument> searchHits = elasticsearchOperations.search(nativeQuery, UserDocument.class);

        //결과를 Page 객체로 반환
        List<UserDocument> content = searchHits.getSearchHits().stream()
                .map(SearchHit::getContent)
                .collect(Collectors.toList());

        return new PageImpl<>(content, pageable, searchHits.getTotalHits());
    }
}
