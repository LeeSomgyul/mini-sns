package com.example.backend.dto;

import com.example.backend.component.ImgproxyConverterComponent;
import lombok.Builder;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.List;


// [외부 통신용] feed 모듈 -> 프론트엔드 출력 용도
@Builder
public record FeedResponse (
        List<PostDto> posts,
        Long nextCursor,
        boolean hasNextPage
){

    @Builder
    public record PostDto(
            Long postId,
            AuthorDto author,
            String content,
            List<MediaDto> media,
            int commentCount,
            int likeCount,
            boolean isLiked,
            boolean isAuthor,
            LocalDateTime createdAt
    ){

        public static PostDto from(
                PostInternalDto postInternalDto,
                AuthorDto authorDto,
                List<MediaDto> mediaDtos
        ){
            return PostDto.builder()
                    .postId(postInternalDto.postId())
                    .author(authorDto)
                    .content(postInternalDto.content())
                    .media(mediaDtos)
                    .commentCount(postInternalDto.commentCount())
                    .likeCount(postInternalDto.likeCount())
                    .isLiked(postInternalDto.isLiked())
                    .isAuthor(postInternalDto.isAuthor())
                    .createdAt(postInternalDto.createdAt())
                    .build();
        }

        @Builder
        public record AuthorDto(
                Long userId,
                String nickname,
                String profileImageUrl
        ){
        }

        @Builder
        public record MediaDto(
                String mediaUrl,
                String type,
                String thumbnailUrl,
                int sortOrder,
                String status,
                String cropState
        ){
            public static final ObjectMapper objectMapper = new ObjectMapper();

            public static MediaDto create (
                    ImgproxyConverterComponent imgproxyConverterComponent,
                    String dbPath,
                    String dbThumbPath,
                    String mediaType,
                    String cropState,
                    int sortOrder,
                    String status,
                    String baseStorageUrl,
                    String imgproxyEndpoint,
                    String imgproxyPrefix,
                    String imgproxyStorageProtocol
            ){
                //[DB에 저장된 "/post..."형식 url을 전체 경로 형식으로 변형]

                if(dbPath != null && dbPath.startsWith("/mini-sns/")){
                    dbPath = dbPath.replace("/mini-sns/", "");
                }

                if(dbThumbPath != null && dbThumbPath.startsWith("/mini-sns/")){
                    dbThumbPath = dbThumbPath.replace("/mini-sns/","");
                }

                // 1.미디어 url 변경
                String finalMediaUrl;
                // 1-1. 비디오일 경우는 imgproxy 미작동
                if("VIDEO".equalsIgnoreCase(mediaType)){
                    finalMediaUrl = (dbPath != null) ? baseStorageUrl + "/" + dbPath : null;
                }else{
                    // 1-2.이미지일 경우에만 imgproxy 작동
                    finalMediaUrl = imgproxyConverterComponent.converter(
                            dbPath,
                            cropState,
                            imgproxyEndpoint,
                            imgproxyPrefix,
                            imgproxyStorageProtocol
                    );
                }

                // 3.썸네일 url 변경
                String finalThumbmailUrl = (dbThumbPath != null) ? baseStorageUrl + "/" + dbThumbPath : null;

                // 4. 변형된 url로 프론트 응답
                return new MediaDto(
                    finalMediaUrl,
                    mediaType,
                    finalThumbmailUrl,
                    sortOrder,
                    status,
                    cropState
                );
            }
        }
    }
}
