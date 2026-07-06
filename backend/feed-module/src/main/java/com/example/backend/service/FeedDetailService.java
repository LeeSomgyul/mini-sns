package com.example.backend.service;

import com.example.backend.client.PostInternalClient;
import com.example.backend.component.ImgproxyConverterComponent;
import com.example.backend.dto.FeedDetailResponse;
import com.example.backend.dto.PostInternalDto;
import com.example.backend.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeedDetailService {

    @Value("${minio.endpoint}") private String minioEndpoint;
    @Value("${minio.bucket}") private String minioBucket;
    @Value("${imgproxy.endpoint}") private String imgproxyEndpoint;
    @Value("${imgproxy.prefix}") private String imgproxyPrefix;
    @Value("${imgproxy.storage-protocol}") private String imgproxyStorageProtocol;

    private final PostInternalClient postInternalClient;
    private final ImgproxyConverterComponent imgproxyConverterComponent;

    public FeedDetailResponse getFeedDetail(Long postId, Long currentUserId){
        // 1. post 모듈에게 단건 데이터 요청
        List<PostInternalDto> realPosts = postInternalClient.getPostsBulk(List.of(postId), currentUserId);

        // 2. 게시물 존재 여부 검증
        if(realPosts == null || realPosts.isEmpty()){
            throw new NotFoundException("존재하지 않거나 삭제된 게시물입니다.");
        }

        // 3. 가져온 1개 데이터 추출
        PostInternalDto targetPost = realPosts.get(0);

        // 4. 미디어 전체 경로 조립
        String baseStorageUrl = minioEndpoint + "/" + minioBucket;

        return convertToFeedDetailResponse(targetPost, baseStorageUrl);
    }

    // [보조 메서드] 단건 응답 객체 조립
    private FeedDetailResponse convertToFeedDetailResponse(PostInternalDto postInternalDto, String baseStorageUrl){
        // 1. 작성자 조립
        FeedDetailResponse.AuthorDto authorDto = FeedDetailResponse.AuthorDto.builder()
                .userId(postInternalDto.author().userId())
                .nickname(postInternalDto.author().nickname())
                .profileImageUrl(postInternalDto.author().profileImageUrl())
                .build();

        // 2. 미디어 조립
        List<FeedDetailResponse.MediaDto> mediaDtos = postInternalDto.media().stream()
                .map(media -> FeedDetailResponse.MediaDto.create(
                        imgproxyConverterComponent, // 우리가 밖으로 빼낸 컨버터 컴포넌트!
                        media.mediaUrl(),
                        media.thumbnailUrl(),
                        media.type(),
                        media.cropState(),
                        media.sortOrder(),
                        media.status(),
                        baseStorageUrl,
                        imgproxyEndpoint,
                        imgproxyPrefix,
                        imgproxyStorageProtocol
                ))
                .toList();

        return FeedDetailResponse.from(postInternalDto, authorDto, mediaDtos);
    }
}
