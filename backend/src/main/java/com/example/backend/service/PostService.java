package com.example.backend.service;

import com.example.backend.dto.post.PostRequest;
import com.example.backend.dto.post.PostResponse;
import com.example.backend.entity.Post;
import com.example.backend.entity.PostMedia;
import com.example.backend.entity.PostTag;
import com.example.backend.entity.User;
import com.example.backend.exception.InvalidRequestException;
import com.example.backend.exception.InvalidTokenException;
import com.example.backend.repository.PostMediaRepository;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PostService {

    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final PostMediaRepository postMediaRepository;


    //게시물 등록
    public PostResponse createPost(
            Long authorId,
            PostRequest request
    ) {
        List<PostRequest.MediaUploadRequest> mediaList = request.mediaList();

        //400 에러: 업로드하는 파일 개수 검증
        if(mediaList == null || mediaList.isEmpty()){
            throw new InvalidRequestException("사진이나 영상을 최소 1개 이상 등록해 주세요.");
        }

        if(mediaList.size() > 5){
            throw new InvalidRequestException("사진과 영상은 최대 5개까지만 올릴 수 있습니다.");
        }

        //401 에러: 유저 검증
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new InvalidTokenException("시간이 만료되어 다시 로그인해주세요."));

        //400 에러: 태그된 유저 검증
        List<User> foundUsers = userRepository.findAllById(request.tagUserIds());
        if(foundUsers.size() != request.tagUserIds().size()){
            throw new InvalidRequestException("존재하지 않는 유저가 태그에 포함되어 있습니다.");
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
                    .thumbnailUrl(null)
                    .cropState(cropStateJson)
                    .sortOrder(i)
                    .build();

            postMediaRepository.save(postMedia);
            post.getMediaList().add(postMedia);
        }

        return PostResponse.of(post, authorId);
    }
}
