package com.example.backend.kafka;

import com.example.backend.config.kafka.KafkaGroupId;
import com.example.backend.config.kafka.KafkaTopics;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class PostHardDeletedConsumer {

    private final S3Client s3Client;

    @Value("${minio.bucket}")
    private String bucket;

    // [MiniO의 실제 파일 경로 삭제 (Hard Delete)]
    @KafkaListener(
            topics = KafkaTopics.POST_MINIO_DELETE_TOPIC,
            groupId = KafkaGroupId.GROUP_POST_HARD_DELETE,
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumerPostHardDelete(PostHardDeletedEvent event){
        log.info("[Kafka Consumer] MinIO/S3 파일 삭제 이벤트 수신 - postId: {}", event.postId());

        List<String> targetObjectPaths = event.targetObjectPaths();
        if(targetObjectPaths == null || targetObjectPaths.isEmpty()){
            log.info("[Kafka Consumer] 삭제할 MinIO/S3 파일이 없습니다. - postId: {}", event.postId());
            return;
        }

        targetObjectPaths.forEach(path -> {
            try{
                String objectKey = extractObjectKey(path);

                DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                        .bucket(bucket)
                        .key(objectKey)
                        .build();

                s3Client.deleteObject(deleteObjectRequest);

                log.error("[Kafka Consumer] MinIO/S3 파일 제거 성공: {}", path);
            }catch(Exception e){
                log.error("[Kafka Consumer] MinIO/S3 파일 제거 실패: {}", path, e);
            }
        });
    }

    // [보조 메서드] path에서 http 등 필요없는것 떼고 실제 파일 경로 추출
    // 전: http://localhost:9000/my-bucket/posts/video_123/
    // 후: posts/video_123/
    public String extractObjectKey(String path){
        if(path.contains(bucket + "/")){
            return path.substring(path.indexOf(bucket+"/") + bucket.length()+1);
        }
        return path;
    }
}
