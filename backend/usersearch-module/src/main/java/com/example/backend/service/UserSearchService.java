package com.example.backend.service;


import com.example.backend.document.UserDocument;
import com.example.backend.dto.TagUserSearchRequest;
import com.example.backend.dto.TagUserSearchResponse;
import com.example.backend.dto.UserSearchResponse;
import com.example.backend.entity.UserFollowCache;
import com.example.backend.repository.UserFollowCacheRepository;
import com.example.backend.repository.UserSearchRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
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
        // - 내가 팔로우하는 사람들 중에서 특정 검색어(닉네임/이름)에 맞는 유저를 찾아, 정렬된 순서대로 화면에 보여줄 만큼만 가져오는 역할
        // 2-1. size + 1개를 조회하여 다음 페이지 존재 여부 확인
        int querySize = request.size() + 1;

        

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
