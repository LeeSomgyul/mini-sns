package com.example.backend.component;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class ImgproxyConverterComponent {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public String converter(
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
