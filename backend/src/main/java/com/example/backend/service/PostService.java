package com.example.backend.service;

import com.example.backend.dto.PostRequest;
import com.example.backend.dto.PostResponse;
import com.example.backend.entity.Post;
import com.example.backend.entity.PostTag;
import com.example.backend.entity.User;
import com.example.backend.exception.InvalidRequestException;
import com.example.backend.exception.InvalidTokenException;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PostService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;


    //게시물 등록
    public PostResponse createPost(
            Long authorId,
            PostRequest request,
            List<MultipartFile> files,
            List<MultipartFile> thumbnails
    ) {
        //400 에러: 업로드하는 파일 개수 검증
        if(files == null || files.isEmpty() || files.size() > 5){
            throw new InvalidRequestException("사진이나 영상을 최소 1개 이상 등록해 주세요.");
        }

        if(files.size() > 5){
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
            validatedFile(file);//파일 용량 및 확장자 체크
        }

    }

    //[메서드] 파일 용량 및 확장자 체크
    private void validatedFile(MultipartFile file){

    }
}
