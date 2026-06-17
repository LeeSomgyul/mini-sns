package com.example.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@SpringBootApplication
public class FeedApplication {
    public static void main(String[] args) {

        SpringApplication.run(FeedApplication.class, args);
    }
}