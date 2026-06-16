//package com.example.backend.common.config;
//
//import com.example.backend.domain.auth.repository.LocalAccountRepository;
//import com.example.backend.domain.search.document.UserDocument;
//import com.example.backend.domain.search.repository.UserSearchRepository;
//import com.example.backend.domain.user.entity.LocalAccount;
//import com.example.backend.domain.user.entity.User;
//import com.example.backend.domain.user.repository.UserRepository;
//import org.springframework.boot.CommandLineRunner;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.context.annotation.Profile;
//import org.springframework.security.crypto.password.PasswordEncoder;
//
////🚨초기 더미 데이터 (개발 완료 후 제거)🚨
//@Configuration
//public class DummyInitDataConfig {
//
//    @Bean
//    @Profile("!test") //테스트 환경에서는 작동 금지
//    public CommandLineRunner initData(
//            UserRepository userRepository,
//            LocalAccountRepository localAccountRepository,
//            UserSearchRepository userSearchRepository,
//            PasswordEncoder passwordEncoder
//    ){
//        return args -> {
//            String[] nicknames = {"코딩초보", "자바고수", "스프링마스터", "리액트장인", "더미테스터", "솜규링", "신규607", "완전고수", "완전초보", "자바싫어"};
//            String[] names = {"김철수", "이영희", "지수", "김지수", "홍길동", "이솜귤", "신규테스터", "황길동", "이안경", "이용달"};
//
//            for(int i=0; i<10; i++){
//                String email = "test" + (i+1) + "@example.com";
//                String nickname = nicknames[i];
//                String name = names[i];
//
//                if(localAccountRepository.findByEmail(email).isEmpty()
//                        && !userRepository.existsByNickname(nickname)){
//                    //1.유저 생성
//                    User user = User.builder()
//                            .name(name)
//                            .nickname(nickname)
//                            .phoneNumber("010" + (10002000+1))
//                            .build();
//                    userRepository.save(user);
//
//                    //2.이메일 계정 생성
//                    LocalAccount account = LocalAccount.builder()
//                            .user(user)
//                            .email(email)
//                            .passwordHash(passwordEncoder.encode("password123!"))
//                            .build();
//                    localAccountRepository.save(account);
//
//                    userSearchRepository.save(UserDocument.from(user));
//
//                    System.out.println("✅ 더미 계정 생성: " + email + " (닉네임: " + nickname + ", 이름: " + name + ")");
//                }
//            }
//
//            System.out.println("✨ 총 10명의 테스트 유저 준비가 완료되었습니다.");
//
//            System.out.println("🔄 MySQL -> Elasticsearch 전체 데이터 동기화 시작...");
//            userRepository.findAll().forEach(user -> {
//                userSearchRepository.save(UserDocument.from(user));
//            });
//            System.out.println("✅ 엘라스틱서치 동기화 완료!");
//        };
//    }
//}
