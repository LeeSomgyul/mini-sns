package com.example.backend.dto;

import com.example.backend.entity.Post;
import com.example.backend.entity.PostMedia;
import com.example.backend.entity.PostTag;
import lombok.Builder;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

public record PostEditResponse(
        Long postId,
        Long authorId,
        String thumbnailUrl,
        List<PostEditResponse.MediaResponse> mediaList,
        String content,
        List<PostEditResponse.TagUserResponse> tagUsers
) {
    public record MediaResponse(
            Long mediaId,
            String type,
            String url,
            String thumbnailUrl,
            int sortOrder,
            String cropState
    ){
        private static final ObjectMapper objectMapper = new ObjectMapper();

        public static PostEditResponse.MediaResponse from (PostMedia postMedia, String minioBaseUrl, String imgproxyEndpoint, String imgproxyPrefix, String imgproxyProtocol){
            String finalUrl = postMedia.getUrl();
            String finalThumbnailUrl = null;
            String cropStateStr = postMedia.getCropState();

            if(finalUrl != null  && !finalUrl.startsWith("http")){
                if(postMedia.getMediaType() == PostMedia.MediaType.VIDEO){
                    finalUrl = minioBaseUrl + postMedia.getUrl();
                    finalThumbnailUrl = finalUrl.replace("master.m3u8", "thumbnail.jpg");
                }else{
                    finalUrl = convertToImgproxyFormat(
                            postMedia.getUrl(),
                            cropStateStr,
                            imgproxyEndpoint,
                            imgproxyPrefix,
                            imgproxyProtocol
                    );
                }
            }

            return new PostEditResponse.MediaResponse(
                    postMedia.getId(),
                    postMedia.getMediaType().name(),
                    finalUrl,
                    finalThumbnailUrl,
                    postMedia.getSortOrder(),
                    cropStateStr
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

    public record TagUserResponse(
            Long userId,
            String nickname
    ){
        public static PostEditResponse.TagUserResponse of(PostTag postTag, String nickname){
            return new PostEditResponse.TagUserResponse(
                    postTag.getUserId(),
                    nickname
            );
        }
    }

    public static PostEditResponse of (Post post, Long authorId, String minioBaseUrl, String imgproxyEndpoint, String imgproxyPrefix, String imgproxyProtocol){
        return new PostEditResponse(
                post.getId(),
                authorId,
                post.getThumbnailUrl(),
                post.getMediaList().stream()
                        .map(media -> MediaResponse.from(media, minioBaseUrl, imgproxyEndpoint, imgproxyPrefix, imgproxyProtocol))
                        .toList(),
                post.getContent(),
                post.getTags().stream()
                        .map(tag -> {
                            //🚨아직 닉네임을 모르니, 임시로 "사용자_숫자ID"로 프론트에 던져줍니다.🚨
                            String tempNickname = "사용자_" + tag.getUserId();
                            return PostEditResponse.TagUserResponse.of(tag, tempNickname);
                        })
                        .toList()
        );
    }


}
