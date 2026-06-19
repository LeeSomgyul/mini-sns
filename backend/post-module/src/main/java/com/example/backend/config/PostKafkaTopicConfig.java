package com.example.backend.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import com.example.backend.config.kafka.KafkaTopics;

@Configuration
public class PostKafkaTopicConfig {
    //[토픽 생성] Media 자바 -> Go 워커 메시지 저장
    @Bean
    public NewTopic videoRequestedTopic(){
        return TopicBuilder.name(KafkaTopics.MEDIA_REQUEST_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    //[토픽 생성] Media Go워커 -> 자바 메시지 저장
    @Bean
    public NewTopic videoCompletedTopic(){
        return TopicBuilder.name(KafkaTopics.MEDIA_COMPLETED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
