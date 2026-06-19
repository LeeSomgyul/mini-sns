package com.example.backend.service;


import com.example.backend.client.PostInternalClient;
import com.example.backend.component.FeedWarmUpComponent;
import com.example.backend.connection.FeedTargetConnection;
import com.example.backend.dto.FeedResponse;
import com.example.backend.dto.PostInternalDto;
import com.example.backend.repository.FeedPostIndexCacheRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeedService {

    @Value("${minio.endpoint}") private String minioEndpoint;
    @Value("${minio.bucket}") private String minioBucket;
    @Value("${imgproxy.endpoint}") private String imgproxyEndpoint;
    @Value("${imgproxy.prefix}") private String imgproxyPrefix;
    @Value("${imgproxy.storage-protocol}") private String imgproxyStorageProtocol;

    private final FeedWarmUpComponent feedWarmUpComponent;
    private final StringRedisTemplate stringRedisTemplate;
    private final FeedTargetConnection feedTargetConnection;
    private final FeedPostIndexCacheRepository feedPostIndexCacheRepository;
    private final PostInternalClient postInternalClient;

    // REDIS KEY: 사용자들 만의 피드 주소 키
    private static final String REDIS_FEED_KEY_PREFIX = "feed:timeline:";

    // [게시물 보기]
    /*
    * @Param currentUserId: 현재 사용자의 ID
    * @Param cursorId: 다음 페이지 요청(무한 스크롤)을 위해 어디까지 봤는지 게시물의 postId
    * @Param size: 한 페이지당 몇 개의 게시물인지
    * */
    @Transactional(readOnly = true)
    public FeedResponse getFeedTimeline(Long currentUserId, Long cursorId, int size){
        // 1.오랫동안 접속 안 한 사용자라서 Redis 비어있으면 실시간 복구
        feedWarmUpComponent.warmupIfEmpty(currentUserId);

        // 2-1. 사용자들 만의 피드 주소 키 가져오기
        String redisKey = REDIS_FEED_KEY_PREFIX + currentUserId;
        // 2-2. Redis에 쌓여있는 500개의 postId 전체를 순서대로 가져오기
        List<String> rawPostIds = stringRedisTemplate.opsForList().range(redisKey,0,-1);
        // 2-3. 최적화: 500개를 다 가져오는게 아니라, 조금씩 잘라서 가져오기
        List<Long> normalPostIds = (rawPostIds != null)?
                rawPostIds.stream()
                    .map(Long::parseLong)
                    .filter(id -> cursorId == null || id < cursorId)
                    .limit(size + 1)
                    .toList()
                :List.of();

        // 3-1. 내가 팔로우하는 인플루언서의 userId 가져오기
        List<Long> pullTargetIds = feedTargetConnection.feedPullTargetIds(currentUserId);
        // 3-2. 인플루언서 중에서, 내가 마지막으로 본 글 다음부터 11개만 가져오기
        List<Long> celebrityPostIds = List.of();
        if (!pullTargetIds.isEmpty()) {
            celebrityPostIds = feedPostIndexCacheRepository.findCelebrityPostIdsWithCursor(
                    pullTargetIds,
                    cursorId,
                    PageRequest.of(0, size + 1)
            );
        }

        // 4-1.일반 친구들 + 인플루언서 병합
        List<Long> mergedIds = new ArrayList<>();
        mergedIds.addAll(normalPostIds);
        mergedIds.addAll(celebrityPostIds);

        // 4-2. 병합된 리스트 내림차순(최신순) 정렬
        List<Long> sortedFeed = mergedIds.stream()
                .distinct()
                .sorted(Comparator.reverseOrder())
                .toList();

        // 5.[무한 스크롤] 페이지 나누기 및 다음 페이지 존재 여부 판별
        // 5-1. 일반 + 인플루언서 리스트 숫자 > 요청한 숫자 라면 뒤에 게시물에 더 있는거임.(위에서 +1해서 가져왔음)*/
        boolean hasNextPage = sortedFeed.size() > size;

        // 5-2. 요청한 size 만큼만 잘라서 최종 리스트 구성
        List<Long> slicedPostIds = hasNextPage ? sortedFeed.subList(0, size) : sortedFeed;

        // 5-3. 다음 스크롤 요청 시 마지막 기준점(postId) 갱신
        Long nextCurosr = slicedPostIds.isEmpty() ? null : slicedPostIds.get(slicedPostIds.size() - 1);

        if(slicedPostIds.isEmpty()){
            return FeedResponse.builder()
                    .posts(List.of())
                    .nextCursor(nextCurosr)
                    .hasNextPage(hasNextPage)
                    .build();
        }

        // 5-4. post 모듈에게 데이터 요청 후 가져온 데이터
        List<PostInternalDto> realPosts = postInternalClient.getPostsBulk(slicedPostIds, currentUserId);

        // 5-5. 가져온 데이터를 다시 최신순 리스트대로 정렬
        Map<Long, PostInternalDto> postMap = realPosts.stream()
                .collect(Collectors.toMap(PostInternalDto::postId, post -> post));

        /* 프론트에 전송할 미디어 전체 경로 */
        String baseStorageUrl = minioEndpoint + "/" + minioBucket;

        //7.FeedResponse 반환
        List<FeedResponse.PostDto> postDtos = slicedPostIds.stream()
                .map(postMap::get)
                .filter(Objects::nonNull)
                .map(postInternalDto -> convertToPostDto(postInternalDto, baseStorageUrl))
                .toList();

        return FeedResponse.builder()
                .posts(postDtos)
                .nextCursor(nextCurosr)
                .hasNextPage(hasNextPage)
                .build();
    }

    // [보조 메서드] PostInternalDto를 받아 조립
    private FeedResponse.PostDto convertToPostDto(PostInternalDto postInternalDto, String baseStorageUrl){
        // 1. 미디어 조립
        List<FeedResponse.PostDto.MediaDto> mediaDtos = postInternalDto.media().stream()
                .map(media -> FeedResponse.PostDto.MediaDto.create(
                       media.mediaUrl(),
                        media.thumbnailUrl(),
                        media.type(),
                        media.cropState(),
                        media.sortOrder(),
                        media.status(),
                        baseStorageUrl,
                        imgproxyEndpoint,
                        imgproxyPrefix,
                        imgproxyStorageProtocol
                ))
                .toList();

        // 2. 작성자 조립
        FeedResponse.PostDto.AuthorDto authorDto = FeedResponse.PostDto.AuthorDto.builder()
                .userId(postInternalDto.author().userId())
                .nickname(postInternalDto.author().nickname())
                .profileImageUrl(postInternalDto.author().profileImageUrl())
                .build();

        return FeedResponse.PostDto.from(postInternalDto, authorDto, mediaDtos);
    }

    // [게시물 삭제]
    // - post모듈의 게시물 삭제에 따른 feed의 DB 및 Redis 정리
    @Transactional
    public void deleteFeedPostIndexCache(Long postId, Long authorId){
        // 1. feed_db의 feed_post_index_cache 테이블의 데이터 삭제
        feedPostIndexCacheRepository.deleteByPostId(postId);
        log.info("[DB 데이터 삭제] feed_post_index_cache 테이블의 postId {} 데이터가 삭제되었습니다.", postId);

        // 2. Redis의 피드 데이터 제거
        String authorKey = REDIS_FEED_KEY_PREFIX + authorId;

        Long redisRemoved = stringRedisTemplate.opsForZSet().remove(authorKey, String.valueOf(postId));

        if(redisRemoved != null && redisRemoved > 0){
            log.info("[Redis 데이터 삭제 성공] feed:timeline: 의 postId {} 데이터가 삭제되었습니다.", postId);
        }else{
            log.info("[Redis 데이터 삭제 실패] feed:timeline: 의 postId {} 데이터 삭제에 실패하였습니다.", postId);
        }
    }

}
