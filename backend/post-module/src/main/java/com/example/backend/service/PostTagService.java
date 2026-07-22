package com.example.backend.service;

import com.example.backend.dto.PostTagResponse;
import com.example.backend.entity.PostTag;
import com.example.backend.exception.NotFoundException;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.PostTagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collector;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostTagService {

    private final PostRepository postRepository;
    private final PostTagRepository postTagRepository;

    // [게시물의 태그 리스트 조회]
    public List<PostTagResponse> getTagsByPostId(Long postId){
        // [예외] 게시물이 없거나 이미 삭제되었는지 확인
        if(!postRepository.existsById(postId)){
            throw new NotFoundException("존재하지 않는 게시물입니다.");
        }

        // 해당 게시물(postId)에 등록된 태그 리스트 가져오기
        List<PostTag> postTags = postTagRepository.findTagsByPostId(postId);

        return postTags.stream()
                .map(tag -> PostTagResponse.of(tag.getUserId(), tag.getTagOrder()))
                .toList();
    }
}
