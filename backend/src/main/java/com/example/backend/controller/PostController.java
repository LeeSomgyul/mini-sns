package com.example.backend.controller;

import com.example.backend.dto.common.ApiResponse;
import com.example.backend.dto.file.PresignedUrlRequest;
import com.example.backend.dto.file.PresignedUrlResponse;
import com.example.backend.dto.post.PostRequest;
import com.example.backend.dto.post.PostResponse;
import com.example.backend.security.CustomUserDetails;
import com.example.backend.service.MinioService;
import com.example.backend.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/posts")
public class PostController {

    private final PostService postService;
    private final MinioService minioService;

//🚨🚨 프론트 UPPY 관련 추가하기 🚨🚨
//    🟢 방법 B: 백엔드 배치(Batch) 작업으로 일괄 청소 (현업 표준)
//    프론트엔드는 이미 올라간 파일이든 아니든 신경 쓰지 않고 글쓰기(Submit) 버튼을 눌렀을 때 최종적으로 남은 파일의 Key들만 서버에 보냅니다.
//
//    백엔드 서버에는 스프링 스케줄러(Scheduler)를 하나 띄워둡니다. 매일 새벽 3시에 MinIO를 쭉 훑으면서, "업로드된 지 24시간이 지났는데 DB의 Post 테이블에 연결되지 않은 잉여 파일들"을 싹 다 지워버립니다.

    //1.Presigned URL 발급 API
    //프론트엔드에서 서버에 파일명을 주면, minio에 업로드할 수 있는 임시 url을 반환
    @PostMapping("/presigned-url")
    public ResponseEntity<ApiResponse<PresignedUrlResponse>> getPresignedUrl(
            @AuthenticationPrincipal CustomUserDetails userDetails,//사용자 검증
            @RequestBody @Valid PresignedUrlRequest request
            ){
        PresignedUrlResponse presignedUrlResponse = minioService.generatePresignedUrl(userDetails.userId(), request);

        return ResponseEntity.ok(ApiResponse.success("URL 발급 성공", presignedUrlResponse));
    }

    //2.최종 게시물 등록 API
    //프론트가 minio에 파일 업로드 완료 후, 해당 경로 및 게시물에 대한 데이터를 DB에 저장
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<PostResponse>> createPost (
            @AuthenticationPrincipal CustomUserDetails userDetails,//사용자 검증
            @RequestBody @Valid PostRequest request
    ){
        //request: 프론트가 minio에 올린 '영상 url'과 '썸네일 url' 경로도 포함
        PostResponse postResponse = postService.createPost(userDetails.userId(), request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("게시글이 등록되었습니다.", postResponse));
    }
}
