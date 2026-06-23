package com.example.backend.service;

import com.example.backend.dto.PostEditResponse;
import com.example.backend.entity.Post;
import com.example.backend.exception.NotFoundException;
import com.example.backend.exception.UnauthorizedException;
import com.example.backend.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PostEditService {

    private final PostRepository postRepository;

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

        // 3. url 경로 조립
        String mediaBaseUrl = imgproxyEndpoint + imgproxyPrefix + imgproxyStorageProtocol;

        // 3. 반환
        return PostEditResponse.of(post, post.getAuthorId(), mediaBaseUrl);
    }
}
