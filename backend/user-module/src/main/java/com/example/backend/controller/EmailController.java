package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.request.EmailSendRequest;
import com.example.backend.dto.request.EmailVerifyRequest;
import com.example.backend.dto.response.EmailSendResponse;
import com.example.backend.dto.response.EmailVerifyResponse;
import com.example.backend.service.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/auth/email")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;

    //이메일 인증 (발송)
    @PostMapping("/send")
    public ResponseEntity<ApiResponse<EmailSendResponse>> sendEmail(@Valid @RequestBody EmailSendRequest request){
        return ResponseEntity.ok(emailService.sendVerificationCode(request));
    }

    //이메일 인증 (검증)
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<EmailVerifyResponse>> verifyEmail(@Valid @RequestBody EmailVerifyRequest request){
        return ResponseEntity.ok(emailService.verificationCode(request));
    }

}
