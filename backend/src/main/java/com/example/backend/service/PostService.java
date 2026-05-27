package com.example.backend.service;

import com.example.backend.dto.post.PostRequest;
import com.example.backend.dto.post.PostResponse;
import com.example.backend.entity.Post;
import com.example.backend.entity.PostMedia;
import com.example.backend.entity.PostTag;
import com.example.backend.entity.User;
import com.example.backend.exception.InvalidRequestException;
import com.example.backend.exception.InvalidTokenException;
import com.example.backend.infrastructure.kafka.Media.MediaProcessEvent;
import com.example.backend.infrastructure.kafka.Media.MediaEventPublisher;
import com.example.backend.repository.PostMediaRepository;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PostService {

    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final PostMediaRepository postMediaRepository;
    private final MediaEventPublisher mediaEventPublisher;


    //[게시물 등록]
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
        User author = userRepository.findById(authorId)
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
        List<User> foundUsers = userRepository.findAllById(request.tagUserIds());
        if(foundUsers.size() != request.tagUserIds().size()){
            throw new InvalidRequestException("존재하지 않는 유저가 태그에 포함되어 있습니다.");
        }

        //400 에러: 중복 태그 방지 (중복된 태그가 있으면 먼저 제거한 뒤 저장됨. 메시지는 임시)
        Set<Long> uniqueTags = new HashSet<>(request.tagUserIds());
        if(uniqueTags.size() != request.tagUserIds().size()){
            throw new InvalidRequestException("중복된 태그가 포함되어 있습니다.");
        }


        //태그된 사용자들을 꺼내기 쉽게 키(User::getId), 값(u) 형태로 저장
        Map<Long, User> userMap = foundUsers.stream()
                .collect(Collectors.toMap(User::getId, u->u));

        //Post 엔티티 저장 (작성자, 글작성 부분만 일단 저장)
        Post post = Post.builder()
                .author(author)
                .content(request.content())
                .build();
        postRepository.save(post);

        //태그 정보 저장(사용자가 선택한 순서대로)
        for(int i=0; i<request.tagUserIds().size(); i++){
            Long targetUserId = request.tagUserIds().get(i);//사용자가 선택한 태그인원의 userId
            User taggedUser = userMap.get(targetUserId);//그 userId에 해당하는 User 객체를 저장

            //PostTag 엔티티 저장
            post.addTag(PostTag.builder()
                            .post(post)
                            .user(taggedUser)
                            .tagOrder(i)
                            .build());
        }

        //미디어 파일 검증 및 업로드
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

            //비디오 타입인 경우 kafka 이벤트 발생
            if(mediaType == PostMedia.MediaType.VIDEO){
                MediaProcessEvent event = MediaProcessEvent.of(
                        post.getId(),
                        mediaUrl,
                        mediaInfo.originalFileName()
                );

                //kafka로 전송
                mediaEventPublisher.publishUploadComplete(event);
            }
        }

        return PostResponse.of(post, authorId);
    }

    //[자식 메서드] url에서 uuid 부분 추출 (=uniqueId 만들기)
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
}
