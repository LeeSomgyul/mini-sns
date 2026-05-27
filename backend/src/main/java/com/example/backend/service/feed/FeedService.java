package com.example.backend.service.feed;

import com.example.backend.dto.feed.FeedResponse;
import com.example.backend.entity.Post;
import com.example.backend.repository.PostRepository;
import com.example.backend.service.connection.FeedTargetConnection;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeedService {

    private final FeedWarmUpComponent feedWarmUpComponent;
    private final StringRedisTemplate stringRedisTemplate;
    private final PostRepository postRepository;
    private final FeedTargetConnection feedTargetConnection;

    private static final String REDIS_FEED_KEY_PREFIX = "feed:timeline:";

    /*
    * @Param currentUserId: 현재 사용자의 ID
    * @Param cursorId: 다음 페이지 요청(무한 스크롤)을 위해 어디까지 봤는지 게시물의 postId
    * @Param size: 한 페이지당 몇 개의 게시물인지
    * */
    @Transactional(readOnly = true)
    public FeedResponse getFeedTimeline(Long currentUserId, Long cursorId, int size){
        //1.오랫동안 접속 안 한 사용자라서 Redis 비어있으면 실시간 복구
        feedWarmUpComponent.warmupIfEmpty(currentUserId);

        //2.내 Redis에서 일반 친구들의 모든 postId 가져오기
        String redisKey = REDIS_FEED_KEY_PREFIX + currentUserId;
        List<String> rawPostIds = stringRedisTemplate.opsForList().range(redisKey,0,-1);

        /*String 타입으로 가져온 postId를 Long 타입으로 변경*/
        List<Long> normalPostIds = (rawPostIds != null) ?
                rawPostIds.stream().map(Long::parseLong).toList() : List.of();

        //3.Redis의 postId를 기반으로 DB에서 실제 게시물 데이터 가져오기
        List<Post> normalPosts = List.of();
        if(!normalPostIds.isEmpty()){
            normalPosts = postRepository.findAllById(normalPostIds).stream()
                    .filter(p -> (cursorId == null || p.getId() < cursorId))
                    .toList();
        }

        //4.내가 팔로우하는 인플루언서의 게시물을 DB에서 가져오기
        List<Long> pullTargetIds = feedTargetConnection.feedPullTargetIds(currentUserId);

        /* 다음 페이지 유무(hasNextPage) 판별을 위해 요청한 size보다 +1개 더 가져오기 */
        List<Post> celebrityPosts = postRepository.findCelebrityPosts(
                pullTargetIds,
                cursorId,
                PageRequest.of(0, size+1)
        );

        //5.일반 친구들 + 인플루언서 병합
        List<Post> mergedList = new ArrayList<>();
        mergedList.addAll(normalPosts);
        mergedList.addAll(celebrityPosts);

        /* 중복 게시물 제거 및 postId 내림차순(최신순) 정렬 */
        List<Post> sortedFeed = mergedList.stream()
                .distinct()
                .sorted(Comparator.comparing(Post::getId).reversed())
                .toList();

        //6.[무한 스크롤] 페이지 나누기 및 다음 페이지 존재 여부 판별
        /* 일반 + 인플루언서 리스트 숫자 > 요청한 숫자 라면 뒤에 게시물에 더 있는거임.(위에서 +1해서 가져왔음)*/
        boolean hasNextPage = sortedFeed.size() > size;

        /* 요청한 size 만큼만 잘라서 최종 리스트 구성 */
        List<Post> slicedPosts = hasNextPage ? sortedFeed.subList(0, size) : sortedFeed;

        /* 다음 스크롤 요청 시 마지막 기준점(postId) 갱신 */
        Long nextCurosr = slicedPosts.isEmpty() ? null : slicedPosts.get(slicedPosts.size() - 1).getId();

        //7.FeedResponse 반환
        List<FeedResponse.PostDto> postDtos = slicedPosts.stream()
                .map(post -> convertToPostDto(post, currentUserId))
                .toList();

        return FeedResponse.of(postDtos, nextCurosr, hasNextPage);
    }

    //[보조 메서드] FeedResponse의 List<PostDto> posts 반환
    private FeedResponse.PostDto convertToPostDto(Post post, Long currentUserId){
        //PostDto의 MediaDto 반환
        List<FeedResponse.PostDto.MediaDto> mediaDtos = post.getMediaList().stream()
                .map(FeedResponse.PostDto.MediaDto::from)
                .toList();

        boolean isLiked = false;//🚨좋아요 기능 구현 이후 연동 필요🚨
        boolean isAuthor = post.getAuthor().getId().equals(currentUserId);

        return FeedResponse.PostDto.from(post, isLiked, isAuthor, mediaDtos);
    }
}
