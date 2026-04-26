package com.example.backend;

import com.example.backend.entity.LocalAccount;
import com.example.backend.entity.User;
import com.example.backend.repository.LocalAccountRepository;
import com.example.backend.repository.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.crypto.password.PasswordEncoder;


@EnableJpaAuditing
@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    //[삭제 예정] 로그인 테스트 사용자(서버 실행 시 1번만 작동)
    @Bean
    public CommandLineRunner initData(UserRepository userRepository,
                                        LocalAccountRepository localAccountRepository,
                                        PasswordEncoder passwordEncoder){
        return args -> {
            //이미 이메일이 존재하면 중복 생성하지 않음
            if(localAccountRepository.findByEmail("test@example.com").isEmpty()){
                //1.유저 생성
                User user = User.builder()
                        .name("테스터")
                        .nickname("코딩초보")
                        .phoneNumber("01012345678")
                        .build();
                userRepository.save(user);

                //2.이메일 계정 생성
                LocalAccount account = LocalAccount.builder()
                        .user(user)
                        .email("test@example.com")
                        .passwordHash(passwordEncoder.encode("password123!"))
                        .build();
                localAccountRepository.save(account);

                System.out.println("✅ 테스트용 더미 계정 생성 완료! (test@example.com / password123!)");
            }
        };
    }
}
