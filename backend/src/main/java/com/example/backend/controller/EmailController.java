package com.example.backend.controller;

import com.example.backend.dto.EmailSendRequest;
import com.example.backend.dto.EmailSendResponse;
import com.example.backend.dto.EmailVerifyRequest;
import com.example.backend.dto.EmailVerifyResponse;
import com.example.backend.service.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth/email")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;

    //이메일 인증 (발송)
    @PostMapping("/send")
    public ResponseEntity<EmailSendResponse> sendEmail(@Valid @RequestBody EmailSendRequest request){
        return ResponseEntity.ok(emailService.sendVerificationCode(request));
    }

    //이메일 인증 (검증)
    @PostMapping("/verify")
    public ResponseEntity<EmailVerifyResponse> verifyEmail(@Valid @RequestBody EmailVerifyRequest request){
        return ResponseEntity.ok(emailService.verificationCode(request));
    }

}
