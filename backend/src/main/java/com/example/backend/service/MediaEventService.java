package com.example.backend.service;

import com.example.backend.dto.file.GoWorkerResultResponse;
import com.example.backend.entity.PostMedia;
import com.example.backend.exception.InvalidRequestException;
import com.example.backend.repository.PostMediaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaEventService {

    private final PostMediaRepository postMediaRepository;

    // Go 워커 작업 후 -> 자바가 받은 데이터로 DB 업데이트
    @Transactional
    public void processMediaResult(GoWorkerResultResponse response){
        log.info("💾 DB 업데이트 로직 시작: PostID={}", response.postId());

        //COMPLETED 응답 받기 실패
        if(!"COMPLETED".equals(response.status())){
            postMediaRepository
                    .findByPostIdAndMediaTypeAndUniqueId(response.postId(), PostMedia.MediaType.VIDEO, response.uniqueId())
                    .ifPresent(PostMedia::updateFailedVideo);
            return;
        }

        //COMPLETED 응답 받기 성공
        PostMedia videoMedia = postMediaRepository
                .findByPostIdAndMediaTypeAndUniqueId(response.postId(), PostMedia.MediaType.VIDEO, response.uniqueId())
                .orElseThrow(() -> new InvalidRequestException("비디오 정보를 찾을 수 없습니다."));

        videoMedia.updateReplaceVideo(response.masterUrl(), response.thumbnailUrl());
        log.info("✅ DB 업데이트 완료: PostID={}", response.postId());
    }
}
