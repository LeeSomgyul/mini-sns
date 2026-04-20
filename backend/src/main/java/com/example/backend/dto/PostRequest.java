package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.util.List;

public record PostRequest (

        List<MediaUploadRequest> mediaList,

        @NotBlank(message = "본문을 입력해주세요.")
        @Size(max = 500, message = "본문은 500자를 초과할 수 없습니다.")
        String content,

        @Size(max = 10, message = "태그는 최대 10명까지만 가능합니다.")
        List<Long> tagUserIds


){
    @Builder
    public record MediaUploadRequest(
            String mediaUrl,
            String thumbnailUrl,
            String mediaType
    ){}

    public PostRequest{
        //내용 공백처리
        content = content != null ? content.trim() : "";
        //태그 순서 중복되면 지우기, 태그 없으면 빈 리스드로 바꾸기
        tagUserIds = tagUserIds != null ? tagUserIds.stream().distinct().toList() : List.of();
    }
}
