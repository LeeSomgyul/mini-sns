package com.example.backend.kafka;

import com.example.backend.config.kafka.KafkaGroupId;
import com.example.backend.config.kafka.KafkaTopics;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.util.ArrayList;
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

                // 하위 .m8u3 및 .ts 모두 제거
                if(objectKey.endsWith("/")){
                    deleteDirectory(objectKey);
                }else{
                    // 이미지 파일 삭제
                    DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                            .bucket(bucket)
                            .key(objectKey)
                            .build();
                    s3Client.deleteObject(deleteObjectRequest);
                }
                log.info("[Kafka Consumer] MinIO/S3 파일 제거 성공: {}", path);
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

    // [보조 메서드] path 하위 .m8u3 및 .ts 실제 파일 삭제 실행
    // - folderPrefix: posts/user_83/post_23/109c3b10-2f79-4276-bfcf-8ce61ce812af/
    public void deleteDirectory(String folderPrefix){
        // 1. 해당 폴더 경로로 시작하는 모든 파일 목록 조회
        ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
                .bucket(bucket)
                .prefix(folderPrefix)
                .build();

        ListObjectsV2Response listResponse = s3Client.listObjectsV2(listRequest);

        // 2. 하위 파일들을 한번에 제거하기 위해 list에 저장
        List<ObjectIdentifier> objectsToDelete = new ArrayList<>();
        for(S3Object s3Object : listResponse.contents()){
            objectsToDelete.add(ObjectIdentifier.builder().key(s3Object.key()).build());
        }

        // 3. 삭제 실행
        if(!objectsToDelete.isEmpty()) {
            Delete deletePayload = Delete.builder()
                    .objects(objectsToDelete)
                    .build();

            DeleteObjectsRequest deleteObjectsRequest = DeleteObjectsRequest.builder()
                    .bucket(bucket)
                    .delete(deletePayload)
                    .build();

            s3Client.deleteObjects(deleteObjectsRequest);
            log.info("[MiniO HLS 파일 삭제 완료] 총 {}개 영구 삭제 완료", objectsToDelete.size());
        }else{
            log.info("[MiniO HLS] 폴더 하위에 삭제할 오브젝트가 없습니다.");
    }
}}
