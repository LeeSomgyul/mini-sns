package com.example.backend.service;

import com.example.backend.dto.request.FollowRequest;
import com.example.backend.dto.request.UnfollowRequest;
import com.example.backend.dto.response.FollowResponse;
import com.example.backend.dto.response.UnfollowResponse;
import com.example.backend.entity.Follow;
import com.example.backend.entity.User;
import com.example.backend.exception.InvalidRequestException;
import com.example.backend.exception.NotFoundException;
import com.example.backend.kafka.FollowCountUpdatedEvent;
import com.example.backend.kafka.FollowCountUpdatedPublisher;
import com.example.backend.kafka.UserCelebrityChangedEvent;
import com.example.backend.kafka.UserCelebrityChangedPublisher;
import com.example.backend.repository.FollowRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class FollowService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final FollowCountUpdatedPublisher followCountUpdatedPublisher;
    private final UserCelebrityChangedPublisher userCelebrityChangedPublisher;

    // [팔로우]
    @Transactional
    public FollowResponse follow(Long userId ,FollowRequest request){
        Long targetUserId = request.targetUserId();

        // [예외] 자기 자신 팔로우 불가 예외 처리
        if(userId.equals(targetUserId)){
            throw new InvalidRequestException("자기 자신은 팔로우할 수 없습니다.");
        }

        // [예외] 타겟 사용자가 실제로 존재하는지 검증
        if(!userRepository.existsById(targetUserId)){
            throw new NotFoundException("존재하지 않는 사용자입니다.");
        }

        // [예외] 동일한 유저에게 또 팔로우 요청
        if(followRepository.existsByFollowerIdAndFolloweeId(userId, targetUserId)){
            throw new InvalidRequestException("이미 팔로우한 사용자입니다.");
        }

        // [DB 저장] 팔로우(친구 추가) 시 관계에 대해 DB에 저장
        Follow follow = Follow.builder()
                .followerId(userId)
                .followeeId(targetUserId)
                .build();
        followRepository.save(follow);

        // [카프카] 이벤트 발생: profile의 팔로우 수 업데이트
        FollowCountUpdatedEvent event = FollowCountUpdatedEvent.of(userId, targetUserId, "FOLLOW");
        followCountUpdatedPublisher.publish(event);

        // [카프카] 이벤트 발생: 유저 팔로잉 수 확인 후 인플루언서로 변경
        Long followerCount = followRepository.countByFolloweeId(targetUserId);

        if(followerCount == 3){
            User followee = userRepository.findById(targetUserId).orElseThrow();
            followee.changeCelebrityStatus(true);

            UserCelebrityChangedEvent celebrityEvent = new UserCelebrityChangedEvent(targetUserId, true);
            userCelebrityChangedPublisher.publish(celebrityEvent);
        }

        return FollowResponse.of(userId, targetUserId);
    }

    // [언팔로우]
    @Transactional
    public UnfollowResponse unfollow (Long userId, UnfollowRequest request){
        Long targetUserId = request.targetUserId();

        // [예외] 자기 자신 언팔로우 불가 예외 처리
        if(userId.equals(targetUserId)){
            throw new InvalidRequestException("자기 자신은 언팔로우할 수 없습니다.");
        }

        // [예외] 타겟 사용자가 실제로 존재하는지 검증
        if(!userRepository.existsById(targetUserId)){
            throw new NotFoundException("존재하지 않는 사용자입니다.");
        }

        // [예외 & DB 조회] 팔로우 관계 존재 확인
        Follow follow = followRepository.findByFollowerIdAndFolloweeId(userId, targetUserId)
                .orElseThrow(() -> new InvalidRequestException("팔로우하지 않은 사용자입니다."));

        // [DB] 관계 삭제
        followRepository.delete(follow);

        // [카프카] 이벤트 발생: feed 모듈 & userSearch 모듈에 전달
        FollowCountUpdatedEvent event = FollowCountUpdatedEvent.of(userId, targetUserId, "UNFOLLOW");
        followCountUpdatedPublisher.publish(event);

        // [카프카] 이벤트 발생: 유저 팔로잉 수 확인 후 일반 인플루언서 -> 일반 사용자로 변경
        Long followerCount = followRepository.countByFolloweeId(targetUserId);

        if(followerCount == 2){
            User followee = userRepository.findById(targetUserId).orElseThrow();
            followee.changeCelebrityStatus(false);

            UserCelebrityChangedEvent celebrityEvent = new UserCelebrityChangedEvent(targetUserId, false);
            userCelebrityChangedPublisher.publish(celebrityEvent);
        }

        return UnfollowResponse.of(userId, targetUserId);
    }
}
