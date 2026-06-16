package com.example.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

// application.yml에서 'api.security'로 시작하는 설정을 매핑
// - 하이픈(-) 리스트를 자바의 List 구조로 받아오는 역할
@ConfigurationProperties(prefix = "api.security")
public record ApiSecurityProperties(
        List<String> permitUrls
) {

}
