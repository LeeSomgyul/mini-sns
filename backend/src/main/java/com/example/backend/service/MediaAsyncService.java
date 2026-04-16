//PostService에서 데이터를 받아서 -> LocalMediaUploadService에 전달해서 썸네일 추출 완료되면 DB에 갈아 끼우는 역할
//즉, PostSerive의 속도에 맞추지 않고 비동기처리 관리하는 클래스
package com.example.backend.service;

import com.example.backend.entity.Post;
import com.example.backend.entity.PostMedia;
import com.example.backend.exception.NotFoundException;
import com.example.backend.repository.PostMediaReposity;
import com.example.backend.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaAsyncService {

    private final MediaUploadService mediaUploadService;
    private final PostMediaReposity postMediaReposity;
    private final PostRepository postRepository;

    @Async("ffmpegTaskExecutor")
    @Transactional
    public void videoThumbnailAsync(String videoUrl, Long postMediaId, Long postId, boolean isThumbnail){

        try{
            //FFmpeg로 영상 썸네일 추출해오기 (예:"/image/video.jpg")
            String videoThumbnailUrl = mediaUploadService.generateThumbnail(videoUrl);

            //PostMedia 테이블의 임시 기본 썸네일을 실제 영상 썸네일로 교체하여 저장
            PostMedia postMedia = postMediaReposity.findById(postMediaId)
                    .orElseThrow(() -> new NotFoundException("해당 미디어를 찾을 수 없습니다."));
            postMedia.updateThumbnailUrl(videoThumbnailUrl);

            //0번 미디어가 영상이었다면, Post 테이블에도 임시 기본 썸네일이었기 때문에 실제 영상 썸네일로 교체하여 저장
            if(isThumbnail){
                Post post = postRepository.findById(postId)
                        .orElseThrow(() -> new NotFoundException("해당 피드를 찾을 수 없습니다."));
                post.updateThumbnailUrl(videoThumbnailUrl);
            }
        }catch(Exception e) {
            log.error("썸네일 비동기 작업 실패: ", e);

            //썸네일 추출 실패 시, 기본 이미지로 처리
            PostMedia postMedia = postMediaReposity.findById(postMediaId)
                    .orElseThrow(() -> new NotFoundException("해당 미디어를 찾을 수 없습니다."));
            postMedia.updateThumbnailUrl("/images/default_loading_image.png");

            //만약 Post의 메인 썸네일인 경우에도, 기본 이미지로 처리
            if (isThumbnail) {
                Post post = postRepository.findById(postId)
                        .orElseThrow(() -> new NotFoundException("해당 피드를 찾을 수 없습니다."));
                post.updateThumbnailUrl("/images/default_loading_image.png");
            }
        }
    }
}
