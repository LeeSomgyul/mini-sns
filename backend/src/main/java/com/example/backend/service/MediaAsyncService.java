package com.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MediaAsyncService {

    @Async("ffmpegTaskExecutor")
    @Transactional
    public void videoThumbnailAsync(){
        //썸네일 url 추출해서 가져오기

    }
}
