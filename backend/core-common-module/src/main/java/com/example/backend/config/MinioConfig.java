package com.example.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.S3Presigner.Builder;

import java.net.URI;

//[역할] SpringBoot와 MiniO 연결 설정
//- 로컬: endpoint 값이 있으므로 MinIO로 연결됨
//- AWS: endpoint 값을 비워두면 자동으로 진짜 S3로 연결됨 (IAM Role로 인증)
@Slf4j
@Configuration
public class MinioConfig {

    // 서버(도커 컨테이너) <--> 저장소 통신용
    // - 로컬: MinIO 컨테이너 이름
    // - AWS: 비워둠
    @Value("${minio.internal-endpoint}")
    private String internalEndpoint;

    // 브라우저가 접근할 주소 (presigned URL 생성용)
    // - 로컬: localhost
    // - AWS: 비워둠
    @Value("${minio.endpoint}")
    private String endpoint;

    // - 로컬: MinIO 계정 정보
    // - AWS: 비워두면 EC2의 IAM Role로 자동 인증
    @Value("${minio.accessKey}")
    private String accessKey;

    @Value("${minio.secretKey}")
    private String secretKey;

    //[일반적인 S3 작업 담당] 업로드 시작, 조각 목록 조회, 조립, 취소 등
    @Bean
    public S3Client s3Client(){
        S3ClientBuilder builder = S3Client.builder()
                .region(Region.AP_NORTHEAST_2) //어느 지역의 서버인지 (서울)
                .serviceConfiguration(S3Configuration.builder()
                        .pathStyleAccessEnabled(true) //minio 사용 시 필수 (S3에선 자동 무시됨)
                        .build());

        // 로컬(MiniO)일 때만 주소를 직접 지정. AWS(S3)에서는 값이 없으니까 SDK 기본 S3 주소 사용
        if(internalEndpoint != null && !internalEndpoint.isBlank()){
            builder.endpointOverride(URI.create(internalEndpoint));
        }

        // 로컬(MiniO)일 때만 계정 직접 지정. AWS(S3)에서는 값이 없기 때문에 IAM Role로 자동 인증
        if(accessKey != null && !accessKey.isBlank()){
            builder.credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKey, secretKey)
            ));
        }

        return builder.build();
    }

    //[Presigned URL 발급 전용]
    @Bean
    public S3Presigner s3Presigner(){
        Builder builder = S3Presigner.builder()
                .region(Region.AP_NORTHEAST_2)
                .serviceConfiguration(S3Configuration.builder()
                        .pathStyleAccessEnabled(true)
                        .build());

        if(endpoint != null && !endpoint.isBlank()){
            builder.endpointOverride(URI.create(endpoint));
        }

        if(accessKey != null && !accessKey.isBlank()){
            builder.credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKey, secretKey)
            ));
        }

        return builder.build();
    }
}
