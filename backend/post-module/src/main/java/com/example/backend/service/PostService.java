package com.example.backend.service;


import com.example.backend.dto.PostRequest;
import com.example.backend.dto.PostResponse;
import com.example.backend.entity.Post;
import com.example.backend.entity.PostMedia;
import com.example.backend.entity.PostTag;
import com.example.backend.entity.UserCache;
import com.example.backend.event.PostHardDeleteCompletedEvent;
import com.example.backend.exception.InvalidRequestException;
import com.example.backend.exception.InvalidTokenException;
import com.example.backend.exception.NotFoundException;
import com.example.backend.exception.UnauthorizedException;
import com.example.backend.kafka.*;
import com.example.backend.kafka.media.MediaEventPublisher;
import com.example.backend.kafka.media.MediaProcessEvent;
import com.example.backend.repository.PostMediaRepository;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.PostTageRepository;
import com.example.backend.repository.UserCacheRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PostService {

    private final FeedPushEventPublisher feedPushEventPublisher;
    private final NotificationFeedPublisher notificationFeedPublisher;
    private final PostDeletedPublisher postDeletedPublisher;
    private final MediaEventPublisher mediaEventPublisher;
    private final ObjectMapper objectMapper;
    private final UserCacheRepository userCacheRepository;
    private final PostRepository postRepository;
    private final PostMediaRepository postMediaRepository;
    private final PostTageRepository postTageRepository;
    private final ApplicationEventPublisher applicationEventPublisher;


    // [게시물 등록]
    public PostResponse createPost(
            Long authorId,
            PostRequest request
    ) {
        List<PostRequest.MediaUploadRequest> mediaList = request.mediaList();

        //400 에러: 업로드하는 미디어 개수 검증
        if(mediaList == null || mediaList.isEmpty()){
            throw new InvalidRequestException("사진이나 영상을 최소 1개 이상 등록해 주세요.");
        }

        if(mediaList.size() > 5){
            throw new InvalidRequestException("사진과 영상은 최대 5개까지만 올릴 수 있습니다.");
        }

        //400 에러: 게시글 본문 필수 검증 및 공백 방지
        if(request.content() == null || request.content().trim().isEmpty()){
            throw new InvalidRequestException("본문을 입력해주세요.");
        }

        //400 에러: 게시글 본문 길이 제한
        if(request.content().length() > 500){
            throw new InvalidRequestException("본문은 500자를 초과할 수 없습니다.");
        }

        //401 에러: 유저 검증
        UserCache author = userCacheRepository.findById(authorId)
                .orElseThrow(() -> new InvalidTokenException("시간이 만료되어 다시 로그인해주세요."));

        //400 에러: 자기 자신을 태그했는지 검증
        if(request.tagUserIds() != null && request.tagUserIds().contains(authorId)){
            throw new InvalidRequestException("자기 자신은 태그할 수 없습니다.");
        }

        //400 에러: 태그 10명 초과
        if(request.tagUserIds().size() > 10){
            throw new InvalidRequestException("태그는 최대 10명까지만 가능합니다.");
        }

        //400 에러: 태그된 유저 검증
        List<UserCache> foundUsers = userCacheRepository.findAllById(request.tagUserIds());
        if(foundUsers.size() != request.tagUserIds().size()){
            throw new InvalidRequestException("존재하지 않는 유저가 태그에 포함되어 있습니다.");
        }

        //400 에러: 중복 태그 방지 (중복된 태그가 있으면 먼저 제거한 뒤 저장됨. 메시지는 임시)
        Set<Long> uniqueTags = new HashSet<>(request.tagUserIds());
        if(uniqueTags.size() != request.tagUserIds().size()){
            throw new InvalidRequestException("중복된 태그가 포함되어 있습니다.");
        }

        //태그된 사용자들을 꺼내기 쉽게 키(UserCache::getUserId), 값(u) 형태로 저장
        Map<Long, UserCache> userMap = foundUsers.stream()
                .collect(Collectors.toMap(UserCache::getUserId, u->u));

        //Post 엔티티 저장 (작성자, 글작성 부분만 일단 저장)
        Post post = Post.builder()
                .authorId(authorId)
                .content(request.content())
                .build();
        postRepository.save(post);

        //태그 정보 저장(사용자가 선택한 순서대로)
        for(int i=0; i<request.tagUserIds().size(); i++){
            Long targetUserId = request.tagUserIds().get(i);//사용자가 선택한 태그인원의 userId
            UserCache taggedUser = userMap.get(targetUserId);//그 userId에 해당하는 User 객체를 저장

            //PostTag 엔티티 저장
            post.addTag(PostTag.builder()
                            .post(post)
                            .userId(taggedUser.getUserId())
                            .tagOrder(i)
                            .build());
        }

        //[미디어 파일 검증 및 업로드]
        for(int i=0; i<mediaList.size(); i++){
            //프론트에서 보내준 개별 미디어 정보 꺼내기
            PostRequest.MediaUploadRequest mediaInfo = mediaList.get(i);

            //JSON에서 정보 추출
            String mediaUrl = mediaInfo.mediaUrl();
            String uniqueId = extractUniqueId(mediaUrl);
            PostMedia.MediaType mediaType = PostMedia.MediaType.valueOf(mediaInfo.mediaType());

            //Crop 객체를 JSON 문자열로 변환
            String cropStateJson = null;
            if(mediaInfo.cropState() != null){
                try{
                    cropStateJson = objectMapper.writeValueAsString(mediaInfo.cropState());
                }catch(JsonProcessingException e){
                    throw new InvalidRequestException("크롭 데이터를 처리하는 중 오류가 발생했습니다.");
                }
            }

            //첫 번째 미디어의 썸네일을 POST 엔티티에 저장 (메인 피드 썸네일)
            if(i == 0){
                //등록 초기에는 썸네일 없음 (워커 서버로 작업 후 생성됨)
                post.updateThumbnailUrl(null);
            }

            //PostMedia 엔티티 빌드 -> 개별 상세 화면용
            PostMedia postMedia = PostMedia.builder()
                    .post(post)
                    .mediaType(mediaType)
                    .url(mediaUrl)
                    .uniqueId(uniqueId)
                    .thumbnailUrl(null)
                    .cropState(cropStateJson)
                    .sortOrder(i)
                    .build();

            postMediaRepository.save(postMedia);
            post.getMediaList().add(postMedia);

            if(mediaType == PostMedia.MediaType.VIDEO){
                //[Media kafka publisher] event 메시지 전송
                MediaProcessEvent event = MediaProcessEvent.of(
                        post.getId(),
                        mediaUrl,
                        mediaInfo.originalFileName()
                );
                mediaEventPublisher.publishUploadComplete(event);
            }
        }

        //[Feed Kafka publisher] FeedPushEvent 전송
        FeedPushEvent feedPushEvent = FeedPushEvent.builder()
                .postId(post.getId())
                .authorId(authorId)
                .build();
        feedPushEventPublisher.publishPushEvent(feedPushEvent);

        //[Notifation feed Kafka publisher] NotificationEvent 전송
        // 1. 알림 받아야 하는 대상 id 목록
        //🚨현재는 모든 사용자를 조회하지만, 친구 기능 완료 후 수정하기🚨
        List<Long> targetUserIds = userCacheRepository.findAllIdsExcept(authorId);

        // 2. 이벤트 메시지 발송
        for(Long targetUserId : targetUserIds){
            NotificationFeedEvent notificationFeedEvent = NotificationFeedEvent.builder()
                    .type("NEW_POST")
                    .receiverUserId(targetUserId)   //알람 받을 사람
                    .triggerUserId(authorId)        //알람 보내는 사람 (글 작성자)
                    .targerPostId(post.getId())
                    .createdAt(LocalDateTime.now())
                    .build();
            notificationFeedPublisher.publish(notificationFeedEvent);
        }

        return PostResponse.of(post, authorId);
    }

    // [createPost 자식 메서드] url에서 uuid 부분 추출 (=uniqueId 만들기)
    private String extractUniqueId(String url){
        if(url == null || !url.contains("/")){
            return url;
        }

        // 1. 마지막 슬래시(/) 뒤의 파일명만 추출 (예: "295d1c01-f524-4148-adc4-c788e902fa31.mp4")
        String fileName = url.substring(url.lastIndexOf("/") + 1);

        // 2. 확장자(.mp4) 제거 (예: "295d1c01-f524-4148-adc4-c788e902fa31")
        if(fileName.contains(".")){
            fileName = fileName.substring(0, fileName.lastIndexOf("."));
        }

        return fileName;
    }

    // [게시물 소프트 삭제]
    // postId: 삭제할 게시물 id
    // currentUserId: 현재 로그인하여 요청하는 삭제할 게시물의 작성자 id
    @Transactional
    public void deletePost(Long postId, Long currentUserId){

        // 1. 게시물 조회 및 삭제 확인
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("이미 삭제된 게시물입니다."));

        if(post.isDeleted()){
            throw new NotFoundException("이미 삭제된 게시물입니다.");
        }

        // 2. 403 예외: 본인이 작성한 글이지 확인
        if(!post.getAuthorId().equals(currentUserId)){
            throw new UnauthorizedException("삭제 권한이 없습니다.");
        }

        // 3. 소프트 삭제
        post.softDelete();

        // 4. 카프카 이벤트 발행 (feed 모듈)
        PostDeletedEvent event = PostDeletedEvent.of(post.getId(), post.getAuthorId());
        postDeletedPublisher.publishPostDeleted(event);
    }

    // [게시물 하드(실제) 삭제]
    // baselineDate: 프로그램 전체적으로 DB 및 MiniO 삭제가 실행되는 시간
    @Transactional
    public void cleanupExpiredPosts(LocalDateTime baselineDate){

        log.info("============== [DEBUG] Hard Delete Scheduler Start ==============");
        log.info("[DEBUG] 검색 기준 시간(Threshold): {}", baselineDate);

        // 1. 한 번에 삭제할 데이터 가져오기 (예: 500개씩 쪼개서 삭제)
        int batchSize = 500;

        // 2. 0 ~ 500 번째 데이터까지 가져오기
        Pageable pageable = PageRequest.of(0, batchSize);

        // 2-2. Slice 타입은 아래 데이터를 포함하고 있다.
        // getCount(): 삭제해야 할 데이터 목록
        // hasNext(): 현재 페이지 뒤에 데이터 조각이 더 남았는지 여부
        // isFirst(): 지금 조각이 첫 번째 조각인지 여부
        Slice<Post> postSlice;

        long totalDeletedPostCount = 0;

        do{
            // 3. 레포지토리에서 500개 데이터만 가져옴
            postSlice = postRepository.findPostsToHardDelete(baselineDate, pageable);

            if(postSlice.isEmpty()){
                break;
            }

            // 4. List 형식으로 변환
            List<Post> expriedPosts = postSlice.getContent();

            log.info("[DEBUG] JPA가 찾아온 게시물 개수: {}개", expriedPosts.size());

            List<Long> postIds = expriedPosts.stream().map(Post::getId).toList();

            totalDeletedPostCount += postIds.size();

            // 5. Post_Media 테이블의 삭제 대상 데이터 가져오기
            List<PostMedia> mediaList = postMediaRepository.findByPostIdIn(postIds);

            // 6. MiniO에서 삭제할 대상 postid 및 해당 url추출
            // - Long: postId
            // - List<String>: 위 postId에 속하는 제거해야 하는 url 리스트들
            Map<Long, List<String>> deletedTargerUrls = extractDeletePaths(mediaList);

            // 7. DB 테이블 삭제
            // - 외래키 참조 문제로 tag -> media -> post 테이블 순으로 삭제
            postTageRepository.deleteByPostIdIn(postIds);
            postMediaRepository.hardDeleteByPostIdIn(postIds);
            postRepository.hardDeleteByIdIn(postIds);

            postRepository.flush();

            // 8. DB에서 데이터 삭제 후 스프링 리스터 이벤트 발송
            applicationEventPublisher.publishEvent(
                    new PostHardDeleteCompletedEvent(postIds, deletedTargerUrls)
            );

        }while(postSlice.hasNext());

        log.info("[DB 및 MiniO 정리] 물리 삭제 완료. 총 {}건의 데이터가 영구 제거되었습니다.", totalDeletedPostCount);
    }

    // [cleanupExpiredPosts의 자식 메서드] MiniO에서 삭제할 대상 url추출
    // - Long: postId
    // - List<String>: 위 postId에 속하는 제거해야 하는 url 리스트들
    private Map<Long, List<String>> extractDeletePaths(List<PostMedia> mediaList){
       Map<Long, List<String>> deletePathByPostId = new HashMap<>();

       for(PostMedia media : mediaList){
           Long postId = media.getPost().getId();
           List<String> paths = deletePathByPostId.computeIfAbsent(postId, k -> new ArrayList<>());

           // 미디어 타입(IMAGE or VIDEO)에 따라 그룹
           if("VIDEO".equalsIgnoreCase(media.getMediaType().name())){
                String mediaUrl = media.getUrl();

                // url 에서 마지막 "/" 위치를 찾아 파일명 자르고 폴더까지만 가져오기
                if(mediaUrl != null && mediaUrl.contains("/")){
                    paths.add(mediaUrl.substring(0, mediaUrl.lastIndexOf("/")+1));
                }else{
                    paths.add(mediaUrl);
                }

                // 영상인 경우 썸네일도 제거 대상에 추가
               if(media.getThumbnailUrl() != null && !media.getThumbnailUrl().isBlank()){
                   paths.add(media.getThumbnailUrl());
               }
           }else{
               // 미디어 타입이 이미지면 url 그대로 사용
               paths.add(media.getUrl());
           }
       }

       return deletePathByPostId;
    }
}
