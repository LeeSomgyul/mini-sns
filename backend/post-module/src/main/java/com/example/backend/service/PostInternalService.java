package com.example.backend.service;

import com.example.backend.dto.PostInternalDto;
import com.example.backend.entity.Post;
import com.example.backend.entity.UserCache;
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
    private final UserCacheRepository userCacheRepository;

    // [feed 모듈이 요청한 대로 응답] post 모듈의 PostInternalClient와 연결
    public List<PostInternalDto> getPostsBulk(List<Long> postIds, Long currentUserId){
        if(postIds == null || postIds.isEmpty()){
            return List.of();
        }

        List<Post> posts = postRepository.findPostsWithAuthorAndMediaByIdIn(postIds);

        //🚨좋아요 기능 완료 후 연동🚨
        // 해당 게시글에 로그인한 사용자 (feed 모듈에서 요청 보낸 user)가 좋아요 눌렀는지

        return posts.stream()
                .map(post -> {
                    Long authorId = post.getAuthorId();
                    UserCache userCache = userCacheRepository.findById(authorId)
                            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저 캐시입니다. id=" + authorId));

                    boolean isLiked = false; //🚨좋아요 기능 완료 후 수정. 지금은 일단 false🚨

                    return PostInternalDto.from(userCache, post, currentUserId, isLiked);
                }).toList();
    }
}
