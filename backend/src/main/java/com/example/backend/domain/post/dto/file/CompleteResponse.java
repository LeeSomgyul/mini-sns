package com.example.backend.domain.post.dto.file;

import lombok.Builder;

@Builder
public record CompleteResponse (

        //합체된 파일이 있는 minio의 주소
        String location
){
    @Builder
    public static CompleteResponse of (String location){
        return new CompleteResponse(location);
    }
}
