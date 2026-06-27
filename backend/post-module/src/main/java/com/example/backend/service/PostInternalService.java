package com.example.backend.service;

import com.example.backend.dto.PostInternalDto;
import com.example.backend.entity.Post;
import com.example.backend.entity.UserCache;
import com.example.backend.repository.PostLikeRepository;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.UserCacheRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostInternalService {

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final UserCacheRepository userCacheRepository;

    // [feed 모듈이 요청한 대로 응답] post 모듈의 PostInternalClient와 연결
    public List<PostInternalDto> getPostsBulk(List<Long> postIds, Long currentUserId){
        if(postIds == null || postIds.isEmpty()){
            return List.of();
        }

        // 1. 피드 게시물로 띄울 게시글들 한꺼번에 조회
        List<Post> posts = postRepository.findPostsWithAuthorAndMediaByIdIn(postIds);

        // 2. 로그인한 유저가 게시물 중 실제 좋아요 누른 1페이지(20개) 게시물의 id 가져오기
        List<Long> likedPostIds = postLikeRepository.findLikedPostIdsByUserId(currentUserId, postIds);

        return posts.stream()
                .map(post -> {
                    Long authorId = post.getAuthorId();
                    UserCache userCache = userCacheRepository.findById(authorId)
                            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저 캐시입니다. id=" + authorId));

                    boolean isLiked = likedPostIds.contains(post.getId());

                    return PostInternalDto.from(userCache, post, currentUserId, isLiked);
                }).toList();
    }
}
