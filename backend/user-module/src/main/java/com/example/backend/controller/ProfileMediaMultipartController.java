package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.file.*;
import com.example.backend.jwt.JwtUser;
import com.example.backend.service.UserProfileMultipartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/users/profile/multipart")
public class ProfileMediaMultipartController {

    private final UserProfileMultipartService userProfileMultipartService;

    // [1단계] 프로필 이미지 분할 업로드 시작
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<ProfileCreateMultipartResponse>> profileCreateUpload (
            @AuthenticationPrincipal JwtUser jwtUser,
            @Valid @RequestBody ProfileCreateMultipartRequest request
    ){
        ProfileCreateMultipartResponse response = userProfileMultipartService.profileCreateUpload(
                jwtUser.userId(), request
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("프로필 이미지 업로드 예약에 성공했습니다.", response));
    }

    // [2단계] 이미지 조각 파일 별 Presigned URL 발급 (서명)
    @PostMapping("/sign-part")
    public ResponseEntity<ApiResponse<ProfileSingPartResponse>> profileSignPart (
            @Valid @RequestBody ProfileSingPartRequest request
    ){
       ProfileSingPartResponse response = userProfileMultipartService.profileSignPart(request);

       return ResponseEntity
               .status(HttpStatus.OK)
               .body(ApiResponse.success("조각별 Presigned URL이 성공적으로 발급되었습니다.", response));
    }

    // [3단계] 프론트엔드가 MiniO에 Presigned URL로 파일을 잘 저장했는지 리스트 꺼내서 확인
    @GetMapping("/list-parts")
    public ResponseEntity<ApiResponse<ProfileMultipartListPartsResponse>> listProfileParts(
            @RequestParam String uploadId,
            @RequestParam String objectKey
    ) {
        ProfileMultipartListPartsResponse response = userProfileMultipartService.profileListParts(uploadId, objectKey);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("프로필 업로드 조각 목록 조회에 성공하였습니다.", response));
    }

    // [4단계] MiniO에서 분할된 조각들 가져와서 순서대로 합치기
    @PostMapping("/complete")
    public ResponseEntity<ApiResponse<ProfileCompleteResponse>> completeProfileUpload(
            @Valid @RequestBody ProfileCompleteRequest request
    ) {
        ProfileCompleteResponse response = userProfileMultipartService.profileCompleteMultipart(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("프로필 이미지 조립 및 업로드가 최종 완료되었습니다.", response));
    }

    // [5단계] 프로필 이미지 분할 업로드 시 사용자가 중간에 취소한 경우, MiniO 서버에 저장된 파편들 제거
    @DeleteMapping("/abort")
    public ResponseEntity<ApiResponse<Void>> abortProfileUpload(
            String uploadId, String objectKey
    ) {
        userProfileMultipartService.profileAbortUpload(uploadId, objectKey);

        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.success("프로필 이미지 업로드 작업이 안전하게 취소되었습니다.", null));
    }
}
