package com.example.backend.client;

import com.example.backend.dto.PostInternalDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

// [post 모듈과 통신]
// feed 모듈이 데이터 요청 -> post 모듈이 feed 모듈에게 PostInternalResponse 형식에 맞춰 데이터를 넘겨줌
// - name: 통신 전화기 이름
// - url: post 모듈 서버인 8082를 바라본다
@FeignClient(name = "post-module-client", url = "http://localhost:8082/api")
public interface PostInternalClient {

    // postIds: post 모듈에서 가져올 게시글 id 목록
    // currentUserId: 현재 요청한 유저의 id
    @PostMapping("/v1/internal/posts/bulk")
    List<PostInternalDto> getPostsBulk(
            @RequestBody List<Long> postIds,
            @RequestParam("currentUserId") Long currentUserId
    );
}
