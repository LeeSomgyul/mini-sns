package com.example.backend.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing //생성 일자를 현재 기준으로 자동 생성 (예: createdAt, updatedAt 등)
public class JpaConfig {
}
