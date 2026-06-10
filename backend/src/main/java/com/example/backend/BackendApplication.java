package com.example.backend;

import com.example.backend.domain.search.document.UserDocument;
import com.example.backend.domain.user.entity.LocalAccount;
import com.example.backend.domain.user.entity.User;
import com.example.backend.domain.auth.repository.LocalAccountRepository;
import com.example.backend.domain.user.repository.UserRepository;
import com.example.backend.domain.search.repository.UserSearchRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.crypto.password.PasswordEncoder;


@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {

        SpringApplication.run(BackendApplication.class, args);
    }

}
