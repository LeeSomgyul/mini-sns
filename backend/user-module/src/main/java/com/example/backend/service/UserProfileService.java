package com.example.backend.service;

import com.example.backend.dto.response.UserProfileResponse;
import com.example.backend.entity.User;
import com.example.backend.exception.NotFoundException;
import com.example.backend.exception.RedisLockTimeoutException;
import com.example.backend.kafka.FollowCountUpdatedConsumer;
import com.example.backend.repository.FollowRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserProfileService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final StringRedisTemplate stringRedisTemplate;
    private final RedissonClient redissonClient;

    // [더미 데이터]
    // - 친구가 0명인 유저의 경우, 레디스에 Key 자체가 안 만들어져서 계속 DB를 호출하는 문제를 방어
    // - 이를 막기 위해 빈 데이터가 아니라 조회 결과가 0개이다 라는 것을 명시적으로 알리는 더미 데이터 삽입
    private static final String DUMMY_VALUE = "-1";


    // [메인 로직] 화면에 보여줄 프로필 전체 정보 조립
    // - targetUserId: 가져올 프로필 대상
    // - currentUserId: 현재 로그인한 사용자
    public UserProfileResponse getProfile(Long targetUserId, Long currentUserId){
        // 1. 프로필 주인이 존재하는지 USER DB에서 확인
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 사용자입니다."));

        // 2. 분산 락 처리 (팔로워 수, 팔로잉 수)
        long followerCount = getCountWithLock(FollowCountUpdatedConsumer.RedisKeyType.FOLLOWER_COUNT, targetUserId);
        long followingCount = getCountWithLock(FollowCountUpdatedConsumer.RedisKeyType.FOLLOWING_COUNT, targetUserId);

        // 3. 로그인한 유저 본인의 프로필인지 확인, 타인을 보는 거라면 팔로우 중인지 여부 확인
        boolean isMe = targetUserId.equals(currentUserId);
        Boolean isFollowing = isMe
                ? null  // 본인이면 null반환
                : followRepository.existsByFollowerIdAndFolloweeId(currentUserId, targetUserId);

        // 4. 함께 하는 친구
        long mutualCount = 0L;
        String repNickname = null;

        // 4-1. 방문한 프로필이 본인이 아니고, 로그인 상태라면 '함께 아는 친구' 로직 실행
        if(!isMe && currentUserId != null){
            // 4-2. DB 확인하기 전 레디스에 데이터 있는지 확인해보기
            warmUpSetWithLock(FollowCountUpdatedConsumer.RedisKeyType.FOLLOWING_SET, currentUserId, true);
            warmUpSetWithLock(FollowCountUpdatedConsumer.RedisKeyType.FOLLOWER_SET, targetUserId, false);

            // 4-3 키 조립
            String myFollowingSetKey = FollowCountUpdatedConsumer.generateKey(FollowCountUpdatedConsumer.RedisKeyType.FOLLOWING_SET, currentUserId);
            String targetFollowerSetKey = FollowCountUpdatedConsumer.generateKey(FollowCountUpdatedConsumer.RedisKeyType.FOLLOWER_SET, targetUserId);

            // 4-4. 레디스에서 가져온 값 활용하여 함께 아는 친구 id 목록 추출
            Set<String> mutualFriends = stringRedisTemplate.opsForSet().intersect(myFollowingSetKey, targetFollowerSetKey);

            if(mutualFriends != null){
                // 함께 아는 친구가 0명이라서 더미값이 들어가 있으면 계산에서 제외
                mutualFriends.remove(DUMMY_VALUE);
                mutualCount = mutualFriends.size();

                // 함께 아는 친구가 1명 이상이라면, 대표 닉네임 찾기
                if(mutualCount > 0){
                    Long repUserId = Long.parseLong(mutualFriends.iterator().next());
                    repNickname = userRepository.findById(repUserId).map(User::getNickname).orElse("알 수 없음");
                }
            }
        }

        // [방어] Boolean 타입과 boolean 타입 불일치 문제 막기
        if(isFollowing == null){
            isFollowing = false;
        }

        return UserProfileResponse.from(
                user, followerCount, followingCount,
                isFollowing, isMe,
                mutualCount, repNickname
        );

    }

    // =============================================
    //              Redis 분산 락 메서드
    // =============================================
    // [단순 숫자 카운팅용 분산 락] 수만 명의 요청 중 딱 1명만 DB에서 카운트 쿼리 요청하도록 통제
    private long getCountWithLock(FollowCountUpdatedConsumer.RedisKeyType type, Long userId){
        // 1. 레디스 키 조립
        String redisKey = FollowCountUpdatedConsumer.generateKey(type, userId);

        // 2. 레디스 캐시에 데이터 있는지 우선 확인
        // - 캐시가 있으면: 레디스 캐시에 있는 데이터 반환
        // - 캐시가 없으면: 레디스 분산 락 실행
        String cachedValue = stringRedisTemplate.opsForValue().get(redisKey);
        if(cachedValue != null) return Long.parseLong(cachedValue);

        // 3. 레디스 캐시가 비어있다면, 해당 키 전용 좌물쇠 준비
        String lockKey = "lock:" + redisKey;
        RLock lock = redissonClient.getLock(lockKey);

        try{
            // 4. 락 획득 시도
            // - 최대 5초동안 DB에 들어가기 위해 대기
            // - DB에 진입하면 레디스에 업데이트 할 값을 가져올 수 있음.
            // - 작업 완료 후 자동으로 쫒겨남.
            boolean isLocked = lock.tryLock(5, -1, TimeUnit.SECONDS);
            // - 만약 5초 기다려도 기존에 DB에 들어가있던 스레드가 안나오면 사용자 새로고침 유도
            if(!isLocked){
                throw new RedisLockTimeoutException("현재 조회 요청이 너무 많아 처리가 지연되었습니다. 잠시 후 새로고침 해주세요.");
            }

            // 5. 다른 스레드의 결과를 보고 더블 체크
            // - 이제 내 차례가 되서 DB로 들어가기 전에, 이전 스레드들이 내가 필요한 값을 DB에서 가져왔는지 확인
            // - 만약 이전에 DB에 들어갔다 나온 스레드가 채워놓았으면 DB 진입 안하고 바로 리턴
            cachedValue = stringRedisTemplate.opsForValue().get(redisKey);
            if(cachedValue != null) return Long.parseLong(cachedValue);

            // 6. 진짜 레디스 값이 없다면 DB에 진입하여 가져오기
            long countFromDB = switch (type) {
                case FOLLOWER_COUNT -> followRepository.countByFolloweeId(userId);
                case FOLLOWING_COUNT -> followRepository.countByFollowerId(userId);
                default -> 0L;
            };

            // 7. 레디스 저장
            stringRedisTemplate.opsForValue().set(redisKey, String.valueOf(countFromDB));
            return countFromDB;

        }catch(InterruptedException e){
            // 4번 락 획득 시도에서 스레드가 DB에 들어가기 전 대기할때 튕겼을 경우 예외처리
            Thread.currentThread().interrupt();
            throw new RedisLockTimeoutException("시스템 장애로 프로필 조회가 중단되었습니다.");
        }finally {
            // 작업 완료 후 분산 lock 반환
            if(lock.isLocked() && lock.isHeldByCurrentThread()){
                lock.unlock();
            }
        }
    }

    // [함께 아는 친구 데이터를 Redis에서 가져오는 메서드 + 락]
    private void warmUpSetWithLock(FollowCountUpdatedConsumer.RedisKeyType type, Long userId, Boolean isFollowingSet){
        // 1. 레디스 키 조립
        String redisKey = FollowCountUpdatedConsumer.generateKey(type, userId);

        // 2. 레디스 캐시에 데이터 있는지 우선 확인
        // - 캐시가 있으면: 레디스 캐시에 있는 데이터 반환
        // - 캐시가 없으면: 레디스 분산 락 실행
        Boolean hasKey = stringRedisTemplate.hasKey(redisKey);
        if(Boolean.TRUE.equals(hasKey)) return;

        // 3. 레디스 캐시가 비어있다면, 해당 키 전용 좌물쇠 준비
        String lockKey = "lock:" + redisKey;
        RLock lock = redissonClient.getLock(lockKey);

        try{
            // 4. 락 획득 시도
            // - 최대 5초동안 DB에 들어가기 위해 대기
            // - DB에 진입하면 레디스에 업데이트 할 값을 가져올 수 있음.
            // - 작업 완료 후 자동으로 쫒겨남.
            boolean isLocked = lock.tryLock(5, -1, TimeUnit.SECONDS);
            // - 만약 5초 기다려도 기존에 DB에 들어가있던 스레드가 안나오면 사용자 새로고침 유도
            if(!isLocked){
                throw new RedisLockTimeoutException("현재 조회 요청이 너무 많아 처리가 지연되었습니다. 잠시 후 새로고침 해주세요.");
            }

            // 5. 다른 스레드의 결과를 보고 더블 체크
            // - 이제 내 차례가 되서 DB로 들어가기 전에, 이전 스레드들이 내가 필요한 값을 DB에서 가져왔는지 확인
            // - 만약 이전에 DB에 들어갔다 나온 스레드가 채워놓았으면 DB 진입 안하고 바로 리턴
            hasKey = stringRedisTemplate.hasKey(redisKey);
            if(Boolean.TRUE.equals(hasKey)) return;

            // 6. 함께 아는 친구 비즈니스 로직 시작
            // 6-1. 나를 팔로우하는 사람 or 내가 팔로우하는 사람 id 목록 리스트로 모두 가져오기
            List<Long> ids = isFollowingSet
                    ? followRepository.findFolloweeIdsByFollowerId(userId)
                    : followRepository.findFollowerIdsByFolloweeId(userId);

            if(!ids.isEmpty()){
                // 6-2. DB에 팔로우 데이터가 존재하면 String 배열로 변환한 뒤, Redis Set에 저장
                String[] strIds = ids.stream().map(String::valueOf).toArray(String[]::new);
                stringRedisTemplate.opsForSet().add(redisKey, strIds);
            }else{
                // 6-3. DB에 팔로우 데이터가 없으면(친구가 없는 상황) 더미값 -1 강제 유입
                stringRedisTemplate.opsForSet().add(redisKey, DUMMY_VALUE);
            }
        }catch(InterruptedException e){
            // 4번 락 획득 시도에서 스레드가 DB에 들어가기 전 대기할때 튕겼을 경우 예외처리
            Thread.currentThread().interrupt();
            throw new RedisLockTimeoutException("시스템 장애로 프로필 조회가 중단되었습니다.");
        }finally {
            // 작업 완료 후 분산 lock 반환
            if(lock.isLocked() && lock.isHeldByCurrentThread()){
                lock.unlock();
            }
        }

    }
}
