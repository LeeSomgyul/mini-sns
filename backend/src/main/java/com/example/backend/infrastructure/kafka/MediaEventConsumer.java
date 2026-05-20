package com.example.backend.infrastructure.kafka;

import com.example.backend.dto.file.GoWorkerResultResponse;
import com.example.backend.entity.PostMedia;
import com.example.backend.exception.InvalidRequestException;
import com.example.backend.repository.PostMediaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class MediaEventConsumer {

    private final PostMediaRepository postMediaRepository;

    //Go워커 -> 자바 메시지 수신 및 DB 변경
    @Transactional
    @KafkaListener(topics = "media.video.completed", groupId = "mini-sns-media-backend")
    public void postMediaDBChange(GoWorkerResultResponse response){
        log.info("📥 Go 워커로부터 인코딩 결과 수신 완료: PostID={}", response.postId());

        //COMPLETED 응답 받기 실패
        if(!"COMPLETED".equals(response.status())){
            postMediaRepository
                    .findByPostIdAndMediaType(response.postId(), "VIDEO")
                    .ifPresent(PostMedia::updateFailedVideo);
            return;
        }

        //COMPLETED 응답 받기 성공
        PostMedia videoMedia = postMediaRepository.findByPostIdAndMediaType(response.postId(), "VIDEO")
                .orElseThrow(() -> new InvalidRequestException("비디오 정보를 찾을 수 없습니다."));

        videoMedia.updateReplaceVideo(response.masterUrl(), response.thumbnailUrl());
    }
}
