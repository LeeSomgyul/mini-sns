package com.example.backend.dto;

import lombok.Builder;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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
                    finalMediaUrl = convertToImgproxyFormat(
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
                    // http://localhost/insecure/crop:가로:세로:기준점:X좌표:Y좌표/rotate:회전각도/plain/local:///파일명
                    return imgproxyEndpoint + imgproxyPrefix
                            + "/crop:" + width + ":" + height + ":nowe:" + x + ":" + y
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
