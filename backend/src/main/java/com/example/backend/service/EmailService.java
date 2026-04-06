package com.example.backend.service;

import com.example.backend.dto.EmailSendResponse;
import com.example.backend.exception.CooldownException;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.EmailSendFailureException;
import com.example.backend.exception.InvalidRequestException;
import com.example.backend.repository.LocalAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final StringRedisTemplate stringRedisTemplate;
    private final LocalAccountRepository localAccountRepository;
    private final JavaMailSender mailSender;

    //Redis 데이터 형식
    private static final String REDIS_CODE = "email:verify:code:";//발송된 인증코드
    private static final String REDIS_COOLDOWN = "email:verify:cooldown:";//재전송 제한 시간
    private static final String REDIS_ATTEMPT = "email:verify:attempt:";//같은 인증코드로 몇번 틀렸는지

    @Transactional(readOnly = true)
    public EmailSendResponse sendVerificationCode(String email){

        //인증번호 저장
        String savedCode = stringRedisTemplate.opsForValue().get(REDIS_CODE + email);

        //400 Bad Request: 인증번호 시간 만료로 Redis에 키가 없는 경우
//        if(savedCode == null){
//            throw new InvalidRequestException("인증번호가 만료되었습니다. 재전송 해주세요.");
//        }

        //409 Conflict: 이미 가입된 이메일인 경우
        if(localAccountRepository.existsByEmail(email)){
            throw new DuplicateResourceException("이미 가입된 이메일입니다.");
        }

        //429 Too Many Requests: 30초 내 인증번호 전송 버튼 또 클릭
        if(Boolean.TRUE.equals(stringRedisTemplate.hasKey(REDIS_COOLDOWN + email))){
            throw new CooldownException("잠시 후 다시 시도해 주세요.");
        }

        //인증번호 재전송 요청했을 때 기존 데이터 삭제
        stringRedisTemplate.delete(List.of(REDIS_CODE + email, REDIS_ATTEMPT + email));

        //인증번호 6자리 난수 생성
        String verificationCode = String.format("%06d", new Random().nextInt(1000000));

        //메일 발송
        try{
            sendMail(email, verificationCode);
        }catch(Exception e){
            throw new EmailSendFailureException("메일 발송에 실패했습니다. 관리자에게 문의하세요.");
        }

        //Redis에 상태들 저장 => .set(키, 값, 타임아웃)
        //인증코드(키, 인증코드, 3분)
        stringRedisTemplate.opsForValue().set(REDIS_CODE + email, verificationCode, Duration.ofMinutes(3));
        //재전송 제한(키, 30초 안에 입력했는지 여부(값은 의미없음), 30초)
        stringRedisTemplate.opsForValue().set(REDIS_COOLDOWN + email, "1", Duration.ofSeconds(30));
        //인증번호 몇번 틀렸는지(키, 몇 번 입력했는지, 3분(인증코드와 동일)) -> 이메일 발송 Service에서 틀릴때마다 값 +1
        stringRedisTemplate.opsForValue().set(REDIS_ATTEMPT + email, "0", Duration.ofMinutes(3));

        return EmailSendResponse.builder()
                .status("success")
                .message("인증번호가 발송되었습니다.")
                .data(EmailSendResponse.Data.builder()
                        .expiresIn(180)//3분
                        .build())
                .build();

    }


    //메일 보내는 함수(email: 전송 주소 메일, verificationCode: 6자리 인증번호)
    private void sendMail(String email, String verificationCode){
        //SimpleMailMessage: 간단한 텍스트 전용 메일보내기에 사용
        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(email);//받는사람 메일(어디로 보내나?)
        message.setSubject("[🔐테스트] 회원가입 인증번호입니다.");//메일 제목
        message.setText("인증번호: " + verificationCode + "\n3분 이내에 입력해주세요.");//메일 내용
        mailSender.send(message);//메일 전송
    }


}
