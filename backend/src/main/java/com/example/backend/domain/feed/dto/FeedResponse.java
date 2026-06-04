package com.example.backend.domain.feed.dto;

import com.example.backend.domain.post.entity.Post;
import com.example.backend.domain.post.entity.PostMedia;
import com.example.backend.domain.user.entity.User;
import lombok.Builder;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Builder
public record FeedResponse (
        List<PostDto> posts,
        Long nextCursor,
        boolean hasNextPage
){
    public static FeedResponse of(List<PostDto> posts, Long nextCursor, boolean hasNextPage){
        return new FeedResponse(
              posts,
              nextCursor,
              hasNextPage
        );
    }

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
        public static PostDto from (Post post, boolean isLiked, boolean isAuthor, List<MediaDto> mediaDtos){
            return new PostDto(
                    post.getId(),
                    AuthorDto.from(post.getAuthor()),
                    post.getContent(),
                    mediaDtos,
                    post.getCommentCount(),
                    post.getLikeCount(),
                    isLiked,
                    isAuthor,
                    post.getCreatedAt()
            );
        }

        @Builder
        public record AuthorDto(
                Long userId,
                String nickname,
                String profileImageUrl
        ){
            public static AuthorDto from (User user){
                return new AuthorDto(
                    user.getId(),
                    user.getNickname(),
                    user.getProfileImageUrl()
                );
            }
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

            public static MediaDto from (
                    PostMedia postMedia,
                    String baseStorageUrl,
                    String imgproxyEndpoint,
                    String imgproxyPrefix,
                    String imgproxyStorageProtocol
            ){
                //[DB에 저장된 "/post..."형식 url을 전체 경로 형식으로 변형]
                String dbPath = postMedia.getUrl();
                String dbThumbPath = postMedia.getThumbnailUrl();

                if(dbPath != null && dbPath.startsWith("/mini-sns/")){
                    dbPath = dbPath.replace("/mini-sns/", "");
                }

                if(dbThumbPath != null && dbThumbPath.startsWith("/mini-sns/")){
                    dbThumbPath = dbThumbPath.replace("/mini-sns/","");
                }

                // 1.미디어 url 변경
                String finalMediaUrl;
                // 1-1. 비디오일 경우는 imgproxy 미작동
                if("VIDEO".equalsIgnoreCase(postMedia.getMediaType().name())){
                    finalMediaUrl = (dbPath != null) ? baseStorageUrl + "/" + dbPath : null;
                }else{
                    // 1-2.이미지일 경우에만 imgproxy 작동
                    finalMediaUrl = convertToImgproxyFormat(
                            dbPath,
                            postMedia.getCropState(),
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
                    postMedia.getMediaType().name(),
                    finalThumbmailUrl,
                    postMedia.getSortOrder(),
                    postMedia.getStatus().name(),
                    postMedia.getCropState()
                );
            }

            // [보조 메서드] 이미지 크롭 처리를 위한 imgproxy URL 생성
            private static String convertToImgproxyFormat(
                    String dbPath,
                    String cropState,
                    String imgproxyEndpoint,
                    String imgproxyPrefix,
                    String imgproxyStorageProtocol
            ){
                if(dbPath == null) return null;

                // 1.imgproxy가 MiniO에 저장된 원본 이미지를 찾아오는 경로
                String imgproxyHeader = imgproxyEndpoint + imgproxyPrefix + "/plain/" + imgproxyStorageProtocol;

                // 2.cropState가 비어있으면 Nginx 통과
                if(cropState == null || cropState.isBlank()){
                    return imgproxyEndpoint + dbPath;
                }

                // /3.cropState 값에 따라 이미지 변환
                try{
                    // DB의 JSON 형식 URL을 MAP으로 변환
                    Map<String, Object> cropMap = objectMapper.readValue(cropState, Map.class);

                    // 사용자가 crop 하지 않아서 croppedAreaPixels에 정보가 없으면 기본 경로 반환
                    if(!cropMap.containsKey("croppedAreaPixels") || cropMap.get("croppedAreaPixels") == null){
                        return imgproxyHeader + dbPath;
                    }

                    // 사용자가 이미지 회전했으면 회전값 저장
                    int rotation = 0;
                    if(cropMap.containsKey("rotation") && cropMap.get("rotation") != null){
                        rotation = ((Number) cropMap.get("rotation")).intValue();
                    }

                    // croppedAreaPixels 내부의 값 추출
                    Map<String, Object> pixels = (Map<String, Object>) cropMap.get("croppedAreaPixels");
                    int x = ((Number) pixels.get("x")).intValue();
                    int y = ((Number) pixels.get("y")).intValue();
                    int width = ((Number) pixels.get("width")).intValue();
                    int height = ((Number) pixels.get("height")).intValue();

                    // imgproxy에 전송하기 위한 명령어 조립 (전용 문법 사용)
                    // http://localhost/insecure/crop:가로:세로:X좌표:Y좌표/rotate:회전각도/plain/local:///파일명
                    return imgproxyEndpoint + imgproxyPrefix
                            + "/crop:" + width + ":" + height + ":" + x + ":" + y
                            + "/rotate:" + rotation
                            + "/plain/" + imgproxyStorageProtocol + dbPath;
                }catch(Exception e){
                    System.err.println("[MediaDto] imgproxy 변환 실패: " + e.getMessage());
                }
                return imgproxyHeader + dbPath;
            }
        }
    }
}
