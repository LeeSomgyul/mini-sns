package com.example.backend.config;

import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.ByteArrayDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.*;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.kafka.support.converter.ByteArrayJacksonJsonMessageConverter;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;
import org.springframework.kafka.support.serializer.JacksonJsonSerializer;

import java.util.HashMap;
import java.util.Map;

//application.yml 대체
@EnableKafka
@Configuration
public class KafkaConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    //[자바 -> Go워커]
    // 1.자바에서 메시지를 전송하기 위한 설정
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
        //자바스프링 전용 타입 헤더 제거(Go에게 메시지 전달해야하기 때문)
        jsonSerializer.setAddTypeInfo(false);

        return new DefaultKafkaProducerFactory<>(configProps, stringSerializer, jsonSerializer);
    }

    // 2.자바에서 메시지를 전송할 수 있도록 하는 장치 연결
    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate(){
        return new KafkaTemplate<>(producerFactory());
    }

    //[Go워커 -> 자바]
    // 1.자바에서 메시지를 받기 위한 설정
    @Bean
    public ConsumerFactory<String, Object> consumerFactory(){
        Map<String, Object> configProps = new HashMap<>();

        //[kafka 기본 통신 설정]
        configProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ConsumerConfig.GROUP_ID_CONFIG, "mini-sns-media-backend");
        configProps.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        //[역직렬화 실패 시]: 스레드가 죽지 않도록 방어
        configProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
        configProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);

        //실제 데이터(Go워커가 주는 key, value)는 순수 String으로 받기
        configProps.put(ErrorHandlingDeserializer.KEY_DESERIALIZER_CLASS, ByteArrayDeserializer.class.getName());
        configProps.put(ErrorHandlingDeserializer.VALUE_DESERIALIZER_CLASS, ByteArrayDeserializer.class.getName());

        return new DefaultKafkaConsumerFactory<>(configProps);
    }

    // 2. 자바에서 메시지를 받을 수 있도록 하는 장치 연결 (@KafkaListener 찾아서 받은 결과 메시지 전달)
    @Bean(name = "kafkaListenerContainerFactory")
    public ConcurrentKafkaListenerContainerFactory<String, byte[]> kafkaListenerContainerFactory(){
        //[전달 할 값들]
        ConcurrentKafkaListenerContainerFactory<String, byte[]> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        //[전달 값 채워넣기]
        factory.setConsumerFactory(consumerFactory());
        factory.setConcurrency(3);//동시 처리할 쓰레드 개수(파티션 개수와 동일하게)

        factory.setRecordMessageConverter(new ByteArrayJacksonJsonMessageConverter());

        return factory;
    }



    //[토픽 관련 설정]
    //토픽 개설 위치 명시
    @Bean
    public KafkaAdmin kafkaAdmin(){
        Map<String, Object> configs = new HashMap<>();
        configs.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        return new KafkaAdmin(configs);
    }

    //토픽 생성: 자바 -> Go 워커 메시지 저장
    @Bean
    public NewTopic videoRequestedTopic(){
        return TopicBuilder.name("media.video.requested")
                .partitions(3)
                .replicas(1)
                .build();
    }

    //토픽 생성: Go워커 -> 자바 메시지 저장
    @Bean
    public NewTopic videoCompletedTopic(){
        return TopicBuilder.name("media.video.completed")
                .partitions(3)
                .replicas(1)
                .build();
    }
}
