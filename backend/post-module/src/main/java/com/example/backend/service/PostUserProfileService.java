package com.example.backend.service;

import com.example.backend.config.PostRedisKeyManager;
import com.example.backend.dto.PostUserProfileResponse;
import com.example.backend.entity.PostMedia;
import com.example.backend.exception.NotFoundException;
import com.example.backend.exception.RedisLockTimeoutException;
import com.example.backend.repository.PostMediaRepository;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.UserCacheRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostUserProfileService {

    private final PostRepository postRepository;
    private final PostMediaRepository postMediaRepository;
    private final UserCacheRepository userCacheRepository;
    private final StringRedisTemplate stringRedisTemplate;
    private final RedissonClient redissonClient;

    @Value("${minio.endpoint}") private String minioEndpoint;
    @Value("${minio.bucket}") private String minioBucket;

    // [메인 로직] 화면에 보여줄 프로필 전체 정보 조립
    // - userId: 가져올 프로필 대상
    public PostUserProfileResponse getPostUserProfile(Long userId){

        userCacheRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 사용자입니다."));

        // 1. 게시물 수 캐시 조회 (분산 락)
        long postCount = getPostCountWithLock(userId);

        // 2. 썸네일 경로 조립
        String baseStorageUrl = minioEndpoint + "/" + minioBucket;

        // 3. DB에서 최신 sortOrder = 0인 9개의 썸네일용 미디어 가져오기
        //🚨무한 스크롤 구현해야함🚨
        List<PostMedia> topMediaList = postMediaRepository.findTopMediaByUserId(userId, PageRequest.of(0, 9));

        // 4. 이미지 or 비디오에 따른 썸네일 추출 경로 확인
        // - 이미지는 url에서, 영상의 썸네일은 thumbnail_url에서 가져와야함
        List<String> thumbnails = topMediaList.stream()
                .map(media -> {
                    String targetPath = (media.getMediaType() == PostMedia.MediaType.VIDEO)
                            ? media.getThumbnailUrl()
                            : media.getUrl();

                    // DB에 저장된 경로가 "/"로 시작하는 경우 (원래 "/"없긴 한데 안전하게..)
                    if(targetPath != null && targetPath.startsWith("/")){
                        return baseStorageUrl + targetPath;
                    }
                    return baseStorageUrl + "/" + targetPath;
                })
                .collect(Collectors.toList());

        return PostUserProfileResponse.of(postCount, thumbnails);
    }


    // =============================================
    //              Redis 분산 락 메서드
    // =============================================
    // 수만 명의 요청 중 딱 1명만 DB에서 카운트 쿼리 요청하도록 통제
    private long getPostCountWithLock(Long userId){
        // 1. 레디스 키 생성
        String redisKey = PostRedisKeyManager.generateKey(PostRedisKeyManager.RedisKeyType.POST_COUNT, userId);

        // 2. 레디스에 게시물 수가 저장되어 있는지 먼저 확인
        String cachedValue = stringRedisTemplate.opsForValue().get(redisKey);

        // 3. 레디스에 저장되어 있으면 return
        if(cachedValue != null){
            return Long.parseLong(cachedValue);
        }

        // 4. 분산 락 시작
        // 4-1. 락 전용 키 생성
        String lockKey = PostRedisKeyManager.generateKey(PostRedisKeyManager.RedisKeyType.LOCK_POST_COUNT, userId);
        RLock lock = redissonClient.getLock(lockKey);

        try{
            // 4-2. 락 획득 시도
            // - 최대 5초동안 DB에 들어가기 위해 대기
            // - DB에 진입하면 레디스에 업데이트 할 값을 가져올 수 있음.
            // - 작업 완료 후 자동으로 쫒겨남.
            boolean isLocked = lock.tryLock(5, -1, TimeUnit.SECONDS);
            // - 만약 5초 기다려도 기존에 DB에 들어가있던 스레드가 안나오면 사용자 새로고침 유도
            if(!isLocked){
                throw new RedisLockTimeoutException("현재 조회 요청이 너무 많아 처리가 지연되었습니다. 잠시 후 새로고침 해주세요.");
            }

            // 4-3. 다른 스레드의 결과를 보고 더블 체크
            // - 이제 내 차례가 되서 DB로 들어가기 전에, 이전 스레드들이 내가 필요한 값을 DB에서 가져왔는지 확인
            // - 만약 이전에 DB에 들어갔다 나온 스레드가 채워놓았으면 DB 진입 안하고 바로 리턴
            cachedValue = stringRedisTemplate.opsForValue().get(redisKey);
            if(cachedValue != null) return Long.parseLong(cachedValue);

            // 4-4. 비즈니스 로직: DB로 가서 게시물 개수 세기
            long countFromDB = postRepository.countByAuthorId(userId);

            // 4-5. 레디스 저장
            stringRedisTemplate.opsForValue().set(redisKey, String.valueOf(countFromDB));
            return countFromDB;

        }catch(InterruptedException e){
            // 4번 락 획득 시도에서 스레드가 DB에 들어가기 전 대기할때 튕겼을 경우 예외처리
            Thread.currentThread().interrupt();
            throw new RedisLockTimeoutException("시스템 장애로 프로필 조회가 중단되었습니다.");
        }finally {
            if(lock.isLocked() && lock.isHeldByCurrentThread()){
                lock.unlock();
            }
        }

    }
}
