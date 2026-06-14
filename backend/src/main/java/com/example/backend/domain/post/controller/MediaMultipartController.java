package com.example.backend.domain.post.controller;

import com.example.backend.common.dto.ApiResponse;
import com.example.backend.domain.post.dto.file.*;
import com.example.backend.common.security.CustomUserDetails;
import com.example.backend.domain.post.service.MediaMultipartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/media/multipart")
public class MediaMultipartController {

    public final MediaMultipartService mediaMultipartService;

    //1.업로드 시작: minio에게 uploadId를 받아와서 objectKey와 함께 프론트에게 전달
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<CreateMultipartResponse>> createUpload (
            @AuthenticationPrincipal CustomUserDetails user,//업로드하는 사용자
            @Valid @RequestBody CreateMultipartRequest request
    ){
        Long authorId = user.userId();

        CreateMultipartResponse response = mediaMultipartService.createUpload(authorId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("업로드 예약에 성공했습니다.", response));
    }

    //2.서명: 조각(partNumber)별 Presigned URL 발급
    @PostMapping("/sign-part")
    public ResponseEntity<ApiResponse<SignPartResponse>> signPart(
            @Valid @RequestBody SignPartRequest request
    ){
        SignPartResponse response = mediaMultipartService.signPart(request);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("조각별 Presigned URL이 발급되었습니다.", response));
    }

    //3.확인: minio에 조각들이 잘 도착했나 확인 (전송은 2번과 3번 사이에서 프론트에서 함)
    @GetMapping("/list-parts")
    public ResponseEntity<ApiResponse<MultipartListPartsResponse>> listParts(
            @RequestParam String uploadId,
            @RequestParam String objectKey
    ){
        MultipartListPartsResponse response = mediaMultipartService.listParts(uploadId, objectKey);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("조각 목록 조회에 성공하였습니다.", response));
    }

    //4.조립: 조각들 합치기
    @PostMapping("/complete")
    public ResponseEntity<ApiResponse<CompleteResponse>> completeMultipart(
            @Valid @RequestBody CompleteRequest request
    ){
        CompleteResponse response = mediaMultipartService.completeMultipart(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("파일 조립 및 업로드가 완료되었습니다.", response));
    }

    //5.업로드 취소
    @DeleteMapping("/abort")
    public ResponseEntity<ApiResponse<Void>> abortUpload(
            @RequestParam String uploadId,
            @RequestParam String objectKey
    ){
        mediaMultipartService.abortUpload(uploadId, objectKey);

        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.success("업로드가 삭제되었습니다.", null));
    }
}
