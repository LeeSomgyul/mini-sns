package com.example.backend.service;

import com.example.backend.dto.*;
import com.example.backend.exception.*;
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
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final StringRedisTemplate stringRedisTemplate;
    private final LocalAccountRepository localAccountRepository;
    private final JavaMailSender mailSender;

    //Redis 데이터 형식
    private static final String REDIS_CODE_PREFIX = "email:verify:code:";//발송된 인증코드
    private static final String REDIS_COOLDOWN_PREFIX = "email:verify:cooldown:";//재전송 제한 시간
    private static final String REDIS_ATTEMPT_PREFIX = "email:verify:attempt:";//같은 인증코드로 몇번 틀렸는지
    private static final String REDIS_TOKEN_PREFIX = "email:verify:token:";//인증 완료 토큰 저장

    //이메일 인증번호 발송
    @Transactional(readOnly = true)
    public ApiResponse<EmailSendResponse> sendVerificationCode(EmailSendRequest request){

        //409 Conflict: 이미 가입된 이메일인 경우
        if(localAccountRepository.existsByEmail(request.email())){
            throw new DuplicateResourceException("이미 가입된 이메일입니다.");
        }

        //429 Too Many Requests: 30초 내 인증번호 전송 버튼 또 클릭
        Long expireTime = stringRedisTemplate.getExpire(REDIS_COOLDOWN_PREFIX + request.email(), TimeUnit.SECONDS);
        if(expireTime != null && expireTime > 0){
            throw new CooldownException(expireTime + "초 후에 다시 시도해 주세요.");
        }

        //인증번호 재전송 요청했을 때 기존 데이터 삭제
        stringRedisTemplate.delete(List.of(REDIS_CODE_PREFIX + request.email(), REDIS_ATTEMPT_PREFIX + request.email()));

        //인증번호 6자리 난수 생성
        String verificationCode = String.format("%06d", new Random().nextInt(1000000));

        //메일 발송
        try{
            sendMail(request.email(), verificationCode);
        }catch(Exception e){
            throw new EmailSendFailureException("메일 발송에 실패했습니다. 관리자에게 문의하세요.");
        }

        //Redis에 상태들 저장 => .set(키, 값, 타임아웃)
        //인증코드(키, 인증코드, 3분)
        stringRedisTemplate.opsForValue().set(REDIS_CODE_PREFIX + request.email(), verificationCode, Duration.ofMinutes(3));
        //재전송 제한(키, 30초 안에 입력했는지 여부(값은 의미없음), 30초)
        stringRedisTemplate.opsForValue().set(REDIS_COOLDOWN_PREFIX + request.email(), "1", Duration.ofSeconds(30));
        //인증번호 몇번 틀렸는지(키, 몇 번 입력했는지, 3분(인증코드와 동일)) -> 이메일 발송 Service에서 틀릴때마다 값 +1
        stringRedisTemplate.opsForValue().set(REDIS_ATTEMPT_PREFIX + request.email(), "0", Duration.ofMinutes(3));

        EmailSendResponse emailSendData = EmailSendResponse.builder()
                .expiresIn(180)
                .build();

        return ApiResponse.success("인증 이메일이 성공적으로 발송되었습니다.", emailSendData);
    }


    //메일 보내는 함수(email: 전송 주소 메일, verificationCode: 6자리 인증번호)
    private void sendMail(String email, String verificationCode){
        //SimpleMailMessage: 간단한 텍스트 전용 메일보내기에 사용
        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom("rmawl8600@naver.com");
        message.setTo(email);//받는사람 메일(어디로 보내나?)
        message.setSubject("[🔐테스트] 회원가입 인증번호입니다.");//메일 제목
        message.setText("인증번호: " + verificationCode + "\n3분 이내에 입력해주세요.");//메일 내용
        mailSender.send(message);//메일 전송
    }

    //이메일 인증번호 검증
    public ApiResponse<EmailVerifyResponse> verificationCode(EmailVerifyRequest request){

        //인증 시도 횟수를 Redis에서 가져오기
        String attemptStr = stringRedisTemplate.opsForValue().get(REDIS_ATTEMPT_PREFIX + request.email());
        int currentAttempt = attemptStr != null ? Integer.parseInt(attemptStr) : 0;

        //429 Too Many Requests: 인증 시도 횟수를 5회 초과 시
        if(currentAttempt >= 5){
            stringRedisTemplate.delete(List.of(REDIS_CODE_PREFIX + request.email(), REDIS_ATTEMPT_PREFIX + request.email()));
            throw new MaxAttemptExceededException("인증번호 확인 횟수(5회)를 초과했습니다. 재전송 해주세요.");
        }

        //400 Bad Request: 인증번호 시간 만료(3분)로 Redis에 키가 없는 경우
        String savedCode = stringRedisTemplate.opsForValue().get(REDIS_CODE_PREFIX + request.email());//정답 인증번호
        if(savedCode == null){
            throw new InvalidRequestException("인증번호가 만료되었습니다. 재전송 해주세요.");
        }

        //인증번호 불일치 시 REDIS_ATTEMPT의 value +1
        if(!savedCode.equals(request.code())){
            Long afterAttemp = stringRedisTemplate.opsForValue().increment(REDIS_ATTEMPT_PREFIX + request.email());

            //마지막 1회 남았는데 또 시도하면
            if(afterAttemp != null && afterAttemp >= 5){
                stringRedisTemplate.delete(List.of(REDIS_CODE_PREFIX + request.email(), REDIS_ATTEMPT_PREFIX + request.email()));
                throw new MaxAttemptExceededException("인증번호 확인 횟수(5회)를 초과했습니다. 재전송 해주세요.");
            }

            //1~4회 틀렸을 경우
            int remainCount = 5 - (currentAttempt + 1);
            throw new InvalidRequestException("인증번호가 틀렸습니다. (남은 횟수: " + remainCount + "회)");
        }

        //인증 성공 시 토큰(verifyToken) 생성
        String verifyToken = "v_" + UUID.randomUUID().toString().replace("-", "");

        //토큰 저장
        stringRedisTemplate.opsForValue().set(REDIS_TOKEN_PREFIX + request.email(), verifyToken, Duration.ofMinutes(30));

        //인증 성공 후 기존 데이터 삭제(틀린 횟수, 인증 코드)
        stringRedisTemplate.delete(List.of(REDIS_ATTEMPT_PREFIX + request.email(), REDIS_CODE_PREFIX + request.email()));

        EmailVerifyResponse emailVerifyData = EmailVerifyResponse.builder()
                .verifyToken(verifyToken)
                .build();

        return ApiResponse.success("인증에 성공하였습니다.", emailVerifyData);
    }

}
