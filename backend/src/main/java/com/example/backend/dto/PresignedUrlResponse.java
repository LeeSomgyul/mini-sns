package com.example.backend.dto;

import lombok.Builder;

@Builder
public record PresignedUrlResponse (
    String presignedUrl,//React가 파일을 PUT 방식으로 업로드할 임시 주소 (5분동안 유효)
    String objectKey//minio에 업로드 성공 후, React가 다시 백엔드로 넘겨줄 minio의 내부 파일 경로
){}
