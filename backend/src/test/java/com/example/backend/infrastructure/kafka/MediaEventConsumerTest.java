package com.example.backend.infrastructure.kafka;

import com.example.backend.dto.file.GoWorkerResultResponse;
import com.example.backend.entity.Post;
import com.example.backend.entity.PostMedia;
import com.example.backend.infrastructure.kafka.Media.MediaEventConsumer;
import com.example.backend.repository.PostMediaRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class MediaEventConsumerTest {

    @Mock
    private PostMediaRepository postMediaRepository;

    @InjectMocks
    private MediaEventConsumer mediaEventConsumer;

    @Test
    @DisplayName("✅ Go 워커로부터 COMPLETED 응답을 받으면 DB의 비디오 주소와 상태가 완벽하게 변경된다")
    void success_consume_video_result(){

        //[테스트 데이터]
        Long postId = 1L;
        String uniqueId = "test-uuid-1234";
        String thumbnailUrl = "/mini-sns/posts/user_1/post_1/test-uuid-1234/thumbnail.jpg";
        String masterUrl = "/mini-sns/posts/user_1/post_1/test-uuid-1234/master.m3u8";
        String status = "COMPLETED";

        String originalPath = "posts/user_1/videos/test-uuid.mp4";

        //[DTO 주입] GoWorkerResultResponse
        GoWorkerResultResponse mockResponse = new GoWorkerResultResponse(
                postId, uniqueId, thumbnailUrl, masterUrl, status
        );

        //기존 DB의 가짜 데이터
        Post mockPost = spy(new Post(null,null));
        doReturn(1L).when(mockPost).getId();

        PostMedia existingMedia = PostMedia.builder()
                .post(mockPost)
                .mediaType(PostMedia.MediaType.VIDEO)
                .url(originalPath)
                .build();

        //테스트 레포지토리에서 값 찾기
        when(postMediaRepository.findByPostIdAndMediaType(postId, PostMedia.MediaType.VIDEO))
                .thenReturn(Optional.of(existingMedia));

        //카프카 실행
        mediaEventConsumer.postMediaDBChange(mockResponse);

        //결과 검증
        assertThat(existingMedia.getUrl()).isEqualTo(masterUrl);
        assertThat(existingMedia.getThumbnailUrl()).isEqualTo(thumbnailUrl);
        assertThat(existingMedia.getStatus()).isEqualTo(PostMedia.MediaStatus.COMPLETED);

        //레포지토리 호출 확인
        verify(postMediaRepository, times(1)).findByPostIdAndMediaType(postId, PostMedia.MediaType.VIDEO);
    }

    @Test
    @DisplayName("❌ Go 워커로부터 FAILED 응답을 받으면 즉시 가드절에 걸려 상태만 FAILED로 마킹된다")
    void fail_consume_video_result(){
        //[테스트 데이터]
        Long postId = 2L;
        String uniqueId = "test-uuid-5678";
        String thumbnailUrl = "";
        String masterUrl = "";
        String status = "FAILED";

        String originalPath = "posts/user_2/videos/test-uuid.mp4";

        //[DTO 주입] GoWorkerResultResponse
        GoWorkerResultResponse mockFailResponse = new GoWorkerResultResponse(
                postId, uniqueId, thumbnailUrl, masterUrl, status
        );

        //기존 DB의 가짜 데이터
        Post mockPost = spy(new Post(null,null));
        doReturn(1L).when(mockPost).getId();

        PostMedia existingMedia = PostMedia.builder()
                .post(mockPost)
                .mediaType(PostMedia.MediaType.VIDEO)
                .url(originalPath)
                .build();

        //테스트 레포지토리에서 값 찾기
        when(postMediaRepository.findByPostIdAndMediaType(postId, PostMedia.MediaType.VIDEO))
                .thenReturn(Optional.of(existingMedia));

        //카프카 실행
        mediaEventConsumer.postMediaDBChange(mockFailResponse);

        //결과 검증
        assertThat(existingMedia.getUrl()).isEqualTo(originalPath);
        assertThat(existingMedia.getStatus()).isEqualTo(PostMedia.MediaStatus.FAILED);
    }
}
