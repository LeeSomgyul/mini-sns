package com.example.backend.service;

import com.example.backend.dto.PostEditResponse;
import com.example.backend.dto.PostUpdateRequest;
import com.example.backend.entity.Post;
import com.example.backend.entity.PostTag;
import com.example.backend.exception.NotFoundException;
import com.example.backend.exception.UnauthorizedException;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.PostTagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.IntStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class PostEditService {

    private final PostRepository postRepository;
    private final PostTagRepository postTagRepository;

    @Value("${minio.endpoint}") private String minioEndpoint;
    @Value("${minio.bucket}") private String minioBucket;
    @Value("${imgproxy.endpoint}") private String imgproxyEndpoint;
    @Value("${imgproxy.prefix}") private String imgproxyPrefix;
    @Value("${imgproxy.storage-protocol}") private String imgproxyStorageProtocol;

    // [게시물 수정을 위한 데이터 불러오기]
    @Transactional(readOnly = true)
    public PostEditResponse getPostForEdit(Long postId, Long userId){
        // 1. DB에 게시물 존재 여부 조회
        Post post = postRepository.findByPostWithMedia(postId)
                .orElseThrow(() -> new NotFoundException("존재하지 않거나 삭제된 게시물입니다."));

        if(post.getStatus() == Post.PostStatus.DELETED){
            throw new NotFoundException("존재하지 않거나 삭제된 게시물입니다.");
        }

        // 2. 수정 권한 검증
        if(!post.getAuthorId().equals(userId)){
            throw new UnauthorizedException("해당 게시물에 대한 수정 권한이 없습니다.");
        }

        // 3. minio 경로 조립
        // 결과: http://localhost:9000/mini-sns/
        String minioBaseUrl = minioEndpoint + "/" + minioBucket + "/";

        return PostEditResponse.of(post, post.getAuthorId(), minioBaseUrl, imgproxyEndpoint, imgproxyPrefix, imgproxyStorageProtocol);
    }

    // [게시물 수정 저장 요청]
    @Transactional
    public void updatePost(Long postId, Long userId, PostUpdateRequest request){
        // 1. 수정할 게시물 조회 및 검증
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시물입니다."));

        // 2. 작성자 본인인지 권한 검증
        if(!post.getAuthorId().equals(userId)){
            throw new UnauthorizedException("게시물을 수정할 권한이 없습니다.");
        }

        // 3. content(본문 내용) 및 updated_at 수정
        post.updateContent(request.content());

        // 4. post_tags 테이블의 기존 태그 일괄 삭제
        postTagRepository.deleteByPostId(postId);

        // 5. 새로운 태그가 존재하면 일괄 등록
        if(request.tagUsers() != null && !request.tagUsers().isEmpty()){
            List<PostTag> newTags = IntStream.range(0, request.tagUsers().size())
                            .mapToObj(i -> PostTag.builder()
                                    .post(post)
                                    .userId(request.tagUsers().get(i).userId())
                                    .tagOrder(i)
                                    .build())
                            .toList();
            postTagRepository.saveAll(newTags);
        }

        // JPA의 영속성 문제 해결
        postRepository.saveAndFlush(post);
    }
}
