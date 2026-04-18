package com.example.backend.service;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.PostRequest;
import com.example.backend.dto.PostResponse;
import com.example.backend.entity.Post;
import com.example.backend.entity.PostMedia;
import com.example.backend.entity.PostTag;
import com.example.backend.entity.User;
import com.example.backend.exception.InvalidRequestException;
import com.example.backend.exception.InvalidTokenException;
import com.example.backend.exception.MaxUploadSizeExceededException;
import com.example.backend.repository.PostMediaReposity;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PostService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final PostMediaReposity postMediaReposity;
    private final MediaUploadService mediaUploadService;
    private final MediaAsyncService mediaAsyncService;



    //게시물 등록
    public ApiResponse<PostResponse> createPost(
            Long authorId,
            PostRequest request,
            List<MultipartFile> files
    ) {
        //비어있지 않은 진짜 파일들만 List로 저장
        List<MultipartFile> fileList = files.stream()
                .filter(file -> file != null && !file.isEmpty())
                .toList();

        //400 에러: 업로드하는 파일 개수 검증
        if(fileList.isEmpty()){
            throw new InvalidRequestException("사진이나 영상을 최소 1개 이상 등록해 주세요.");
        }

        if(fileList.size() > 5){
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

        //Post 엔티티 저장
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
        for(int i=0; i<files.size(); i++){
            MultipartFile file = files.get(i);//각 파일 가져오기
            validateFile(file);//파일 용량 및 확장자 체크

            //각 미디어 파일을 하나씩 돌면서 이미지 or 영상으로 분별
            PostMedia.MediaType mediaType = determineMediaType(file);

            //원본 파일을 로컬에 저장하고 -> 해당 파일을 프론트에서 접근할 수 있는 url로 변환하여 받아오기
            // 🚨🚨나중에 실제 서버 저장공간으로 바꾸기(S3 등)🚨🚨
            String mediaUrl = mediaUploadService.uploadOriginalFile(file);

            log.info("{}번 파일 url 변환 완료: url = {}", i+1, mediaUrl);

            //미디어 타입이 이미지 or 영상인 경우의 썸네일 저장
            String currentThumbnailUrl;
            if(mediaType == PostMedia.MediaType.VIDEO){
                //영상 썸네일은 비동기처리 끝나기 전까지 로딩중 이미지 보여주기
                currentThumbnailUrl = "/images/default_loading_image.png";
            }else{
                //이미지 썸네일은 실제 url
                currentThumbnailUrl = mediaUrl;
            }

            //첫번째 썸네일을 POST 엔티티에 저장 -> 메인 피드용
            if(i == 0){
                post.updateThumbnailUrl(currentThumbnailUrl);
            }

            //PostMedia 엔티티 빌드 -> 개별 상세 화면용
            PostMedia postMedia = PostMedia.builder()
                    .post(post)
                    .mediaType(mediaType)
                    .url(mediaUrl)
                    .thumbnailUrl(currentThumbnailUrl)
                    .sortOrder(i)
                    .build();

            postMediaReposity.save(postMedia);

            log.info("PostMedia를 DB에 저장!: {}", mediaUrl);

            //[비동기 호출] 미디어가 영상인 경우에만 FFmpeg 추출 작업 시작
            if(mediaType == PostMedia.MediaType.VIDEO){
                mediaAsyncService.videoThumbnailAsync(
                        mediaUrl,//뭘 추출하는가? -> 영상파일 (위 if문 조건으로 인해 영상 url만 전송됨. 즉, vidioUrl)
                        postMedia.getId(),//추출 후 어디에 저장? -> postMedia
                        post.getId(),//추출된 영상 썸네일은 Post에도 바꿔야함
                        (i==0)//0번째 미디어면 -> true 저장(썸네일은 0번째 게시물)
                );
            }
        }

        //응답 담기
        PostResponse postData = PostResponse.builder()
                .postId(post.getId())
                .authorId(authorId)
                .thumbnailUrl(post.getThumbnailUrl())
                .content(post.getContent())
                .mediaList(post.getMediaList().stream()
                        .map(media -> PostResponse.MediaResponse.builder()
                                .mediaId(media.getId())
                                .type(media.getMediaType().name())
                                .url(media.getUrl())
                                .thumbnailUrl(media.getThumbnailUrl())
                                .sortOrder(media.getSortOrder())
                                .build())
                        .toList())
                .tagUsers(post.getTags().stream()
                        .map(tag -> PostResponse.TagUserResponse.builder()
                                .userId(tag.getUser().getId())
                                .nickname(tag.getUser().getNickname())
                                .build())
                        .toList()
                )
                .build();


        //응답
        return ApiResponse.success("게시글이 등록되었습니다.", postData);
    }

    //[메서드] 파일 용량 및 확장자 체크
    private void validateFile(MultipartFile file){
        //각 파일의 확장자 체크
        String contentType = file.getContentType();

        //각 파일의 용량 체크
        long contentSize = file.getSize();

        //타입 null 체크
        if(contentType == null){
            throw new InvalidRequestException("JPG, PNG, MP4 만 선택 가능합니다.");
        }

        //타입이 만약 image라면(10MB 초과 안됨)
        if(contentType.startsWith("image/")){
            if(contentSize > 10 * 1024 * 1024) {
                throw new MaxUploadSizeExceededException("이미지는 10MB까지 업로드 가능합니다.");
            }
        } else if (contentType.startsWith("video/")) {
            //타입이 만약 vedio라면(100MB 초과 안됨)
            if(contentSize > 100 * 1024 * 1024){
                throw new MaxUploadSizeExceededException("영상은 100MB까지 업로드 가능합니다.");
            }
        }else{
            throw new InvalidRequestException("JPG, PNG, MP4 만 선택 가능합니다.");
        }
    }

    //[메서드] mediaType 판별
    private PostMedia.MediaType determineMediaType(MultipartFile file){
        //각 파일의 타입이 null이 아니거나, 시작을 IMAGE면 이미지, 그 외는 VIDEO
        if(file.getContentType() != null && file.getContentType().startsWith("image/")){
            return PostMedia.MediaType.IMAGE;
        }else{
            return PostMedia.MediaType.VIDEO;
        }
    }
}
