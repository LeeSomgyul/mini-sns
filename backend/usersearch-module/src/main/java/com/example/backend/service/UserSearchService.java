package com.example.backend.service;


import co.elastic.clients.elasticsearch._types.FieldValue;
import com.example.backend.document.UserDocument;
import com.example.backend.dto.TagUserSearchRequest;
import com.example.backend.dto.TagUserSearchResponse;
import com.example.backend.dto.UserSearchResponse;
import com.example.backend.entity.UserFollowCache;
import com.example.backend.repository.UserFollowCacheRepository;
import com.example.backend.repository.UserSearchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import tools.jackson.databind.JavaType;
import tools.jackson.databind.ObjectMapper;

import java.time.Duration;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserSearchService {

    private final UserSearchRepository userSearchRepository;
    private final UserFollowCacheRepository userFollowCacheRepository;
    private final StringRedisTemplate stringRedisTemplate;
    private final ElasticsearchOperations elasticsearchOperations;
    private final ObjectMapper objectMapper;

    private static final String REDIS_USERSEARCH_FOLLOW_CACHE_PREFIX = "usersearch:following";

    // [사용자 전체 검색]
    // keyword: 사용자의 검색어 (예: '홍길동')
    // currentUserId: 현재 로그인한 사용자 본인 id
    // Pageable: "1페이지에 10명씩 보여줘" 라는 요청 설정
    public UserSearchResponse searchUsers(String keyword, Long currentUserId, Pageable pageable){

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


    // [팔로우 기반 사용자 검색]
    // userId: 현재 로그인한 유저 본인
    // request: 프론트의 요청
    public TagUserSearchResponse searchTagUsers(Long userId, TagUserSearchRequest request){
        // 1. 내가 팔로우하는 목록 가져오기
        List<Long> followeeIds = getFolloweeIds(userId);

        // [예외] 팔로우하는 사람이 아무도 없으면 빈 결과 반환
        if(followeeIds.isEmpty()){
            return TagUserSearchResponse.of(Collections.emptyList(), false, null);
        }

        // 2. [엘라스틱서치 search After 쿼리 생성]
        // 2-1. size + 1개를 조회하여 다음 페이지 존재 여부 확인
        int querySize = request.size() + 1;

        // 2-2. 엘라스틱서치 쿼리문
        // - 역할: 내가 팔로우하는 사람들 중에서 특정 검색어(닉네임/이름)에 맞는 유저를 찾아, 정렬된 순서대로 화면에 보여줄 만큼만 가져오는 역할
        /*
        * query: 검색 조건 전체를 담는 최상위 상자 (엘라스틱서치 쿼리 출발점)
        * bool: 여러 조건을 조합해주는 상자 (and, or, not)
        * filter: 필터 조건 (속도 최적화용 조건. 검색어 점수를 계산하지 않고 범위 안에 드는지만 판별)
        * must: 검색 점수 계산 필터 조건 (입력한 검색어 키워드와 얼마나 맞는지 계산하여 가져오기)
        */
        NativeQuery nativeQuery = NativeQuery.builder()
                .withQuery(query -> query.bool(bool -> {
                    // 2-2. 필터링: 팔로잉 유저 id 목록으로 필터링
                    bool.filter(filter -> filter.terms(terms -> terms
                            .field("userId")
                            .terms(termsValue -> termsValue.value(
                                    followeeIds.stream()
                                            .map(id -> FieldValue.of(id.toString()))
                                            .toList()
                            ))
                    ));
                    // 2-3. 필터링: 검색어(이름/닉네임)로 필터링
                    if(StringUtils.hasText(request.keyword())){
                        bool.must(must -> must.multiMatch(multiMatch -> multiMatch
                                .fields("nickname", "name")
                                .query(request.keyword())
                        ));
                    }
                    return bool;
                }))
                // 2-4. 정렬: 닉네임 오름차순, userId 오름차순
                .withSort(Sort.by(
                        Sort.Order.asc("nickname.keyword"),
                        Sort.Order.asc("userId")
                ))
                .withMaxResults(querySize)
                .build();

        // 3. 프론트에서 가져온 searchAfter 커서 적용
        if(request.searchAfter() != null || !request.searchAfter().isEmpty()){
            nativeQuery.setSearchAfter(request.searchAfter());
        }

        // 4. 엘라스틱서치 검색 실행
        SearchHits<UserDocument> searchHits = elasticsearchOperations.search(nativeQuery, UserDocument.class);

        // 5. 검색 결과값만 추출하여 List 형식으로 변환
        List<SearchHit<UserDocument>> searchHitList = searchHits.getSearchHits();

        // 6. [무한스크롤] 다음 페이지 존재 여부 확인 및 size만큼 슬라이싱
        boolean hasNextPage = searchHitList.size() > request.size();
        List<SearchHit<UserDocument>> resultHitList = hasNextPage
                ? searchHitList.subList(0, request.size())
                : searchHitList;

        // 7. Response 반환
        List<TagUserSearchResponse.UserSearchDto> content = resultHitList.stream()
                .map(SearchHit::getContent)
                .map(TagUserSearchResponse.UserSearchDto::from)
                .toList();

        // 8. 다음 페이지 요청에 사용할 search after 추출
        List<Object> nextSearchAfter = null;
        if(hasNextPage && !searchHitList.isEmpty()){
            SearchHit<UserDocument> lastHit = searchHitList.get(searchHitList.size() - 1);
            nextSearchAfter = lastHit.getSortValues();
        }

        return TagUserSearchResponse.of(content, hasNextPage, nextSearchAfter);
    }

    // [메서드] 레디스에서 내가 팔로우하는(팔로잉) id 리스트 조회
    private List<Long> getFolloweeIds(Long userId){

        // 1. 레디스에서 내가 팔로우하는 id 조회
        String redisKey = REDIS_USERSEARCH_FOLLOW_CACHE_PREFIX + userId;
        String redisData = stringRedisTemplate.opsForValue().get(redisKey);

        // 2. [레디스에 저장된 데이터가 있는 경우] String 타입의 팔로우 데이터를 사용 가능한 JSON 형식으로 변환
        // " [8, 15, 20] " => [8L, 15L, 20L]
        if(StringUtils.hasText(redisData)){
            try{
                JavaType type = objectMapper.getTypeFactory()
                        .constructCollectionType(List.class, Long.class); // long 타입의 list 반환

                return objectMapper.readValue(redisData, type);
            }catch (Exception ex){
                log.error("[레디스 값을 JSON으로 변경 실패] Key: {}", redisKey, ex);
            }
        }

        // 3. [레디스에 저장된 데이터가 없는 경우] DB에서 가져오기
        List<Long> followeeIds = userFollowCacheRepository.findByFollowerId(userId)
                .stream()
                .map(UserFollowCache::getFolloweeId)
                .toList();

        // 4. DB에서 찾은 리스트들 레디스에 추가 (레디스 저장 시간 10분 -> 자원 아끼기 위해)
        try{
            stringRedisTemplate.opsForValue().set(
                    redisKey,
                    objectMapper.writeValueAsString(followeeIds),
                    Duration.ofMinutes(10)
            );
        }catch (Exception ex){
            log.error("[DB 값을 레디스에 추가 실패] Key: {}", redisKey, ex);
        }

        return followeeIds;
    }
}
