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

    //[삭제 예정] 테스트 더미 사용자 5명
    @Bean
    public CommandLineRunner initData(UserRepository userRepository,
                                        LocalAccountRepository localAccountRepository,
                                        PasswordEncoder passwordEncoder){
        return args -> {
            String[] nicknames = {"코딩초보", "자바고수", "스프링마스터", "리액트장인", "더미테스터"};
            String[] names = {"김철수", "이영희", "지수", "김지수", "홍길동"};

            for(int i=0; i<5; i++){
                String email = "test" + (i+1) + "@example.com";
                String nickname = nicknames[i];
                String name = names[i];

                if(localAccountRepository.findByEmail(email).isEmpty()
                    && !userRepository.existsByNickname(nickname)){
                    //1.유저 생성
                    User user = User.builder()
                            .name(name)
                            .nickname(nickname)
                            .phoneNumber("010" + (10002000+1))
                            .build();
                    userRepository.save(user);

                    //2.이메일 계정 생성
                    LocalAccount account = LocalAccount.builder()
                            .user(user)
                            .email(email)
                            .passwordHash(passwordEncoder.encode("password123!"))
                            .build();
                    localAccountRepository.save(account);

                    System.out.println("✅ 더미 계정 생성: " + email + " (닉네임: " + nickname + ", 이름: " + name + ")");
                }
            }

            System.out.println("✨ 총 5명의 테스트 유저 준비가 완료되었습니다.");
        };
    }
}
