package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.jwt.JwtUser;
import com.example.backend.service.PostCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/comments")
@RequiredArgsConstructor
public class CommentManageController {

    public final PostCommentService postCommentService;

    // [댓글 하드 삭제 & 게시글 수 차감]
    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @AuthenticationPrincipal JwtUser jwtUser,
            @PathVariable("commentId") Long commentId
    ){
        postCommentService.deleteComment(commentId, jwtUser.userId());

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("댓글이 삭제되었습니다.", null));
    }
}
