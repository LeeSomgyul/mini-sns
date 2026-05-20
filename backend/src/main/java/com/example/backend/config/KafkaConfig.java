package com.example.backend.config;

import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.BeanRegistrarDslMarker;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaAdmin;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.kafka.support.serializer.JacksonJsonSerializer;

import java.util.HashMap;
import java.util.Map;

//application.yml 대체
@Configuration
public class KafkaConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Bean
    public ProducerFactory<String, Object> producerFactory(){
        Map<String, Object> configProps = new HashMap<>();

        //[kafka 기본 통신 설정]
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);//서버 주소 지정
        configProps.put(ProducerConfig.ACKS_CONFIG, "all");//메시지 받았다고 응답할때까지 기다리기
        configProps.put(ProducerConfig.RETRIES_CONFIG, 3);//네트워크 오류 시 3번까지 다시 보냄
        configProps.put(ProducerConfig.LINGER_MS_CONFIG, 10);//0.01초 기다렸다가 메시지 좀 쌓이면 전송
        configProps.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);//중복 전송 방지

        //[직렬화 설정]: 자바 객체를 kafka가 이해할 수 있는 이진 데이터로 변경
        //메시지의 '키'를 문자열(String)로 포장
        StringSerializer stringSerializer = new StringSerializer();
        //메시지의 '값'인 DTO 객체를 JSON 형식으로 포장
        JacksonJsonSerializer<Object> jsonSerializer = new JacksonJsonSerializer<>();
        //자바의 클래스 구조(com.example...) 미포함
        jsonSerializer.setAddTypeInfo(false);

        return new DefaultKafkaProducerFactory<>(configProps, stringSerializer, jsonSerializer);
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate(){
        return new KafkaTemplate<>(producerFactory());
    }

    //토픽 개설 위치 명시 (application.yml 대신)
    @Bean
    public KafkaAdmin kafkaAdmin(){
        Map<String, Object> configs = new HashMap<>();
        configs.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        return new KafkaAdmin(configs);
    }

    //[자바 -> Go 워커 메시지 저장 토픽 생성]
    @Bean
    public NewTopic videoRequestedTopic(){
        return TopicBuilder.name("media.video.requested")
                .partitions(3)
                .replicas(1)
                .build();
    }

    //[Go워커 -> 자바 메시지 저장 토픽 생성]
    @Bean
    public NewTopic videoCompletedTopic(){
        return TopicBuilder.name("media.video.completed")
                .partitions(3)
                .replicas(1)
                .build();
    }
}
