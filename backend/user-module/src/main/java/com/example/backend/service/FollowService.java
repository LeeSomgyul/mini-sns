package com.example.backend.service;

import com.example.backend.entity.Follow;
import com.example.backend.kafka.FollowCountUpdatedEvent;
import com.example.backend.kafka.FollowCountUpdatedPublisher;
import com.example.backend.repository.FollowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

//🚨친구 기능 구현 시 다시 제대로 구현하기(일단 프로필 기능 구현을 위해 임의로 작성함)🚨
@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final FollowCountUpdatedPublisher followCountUpdatedPublisher;

    @Transactional
    public void follow(Long followerId, Long followeeId){

        // 1. 팔로우(친구 추가) 시 관계에 대해 DB에 저장
        Follow follow = Follow.builder()
                .followerId(followerId)
                .followeeId(followeeId)
                .build();
        followRepository.save(follow);

        // 2. 카프카 이벤트 발생: profile의 팔로우 수 업데이트
        FollowCountUpdatedEvent event = new FollowCountUpdatedEvent(followerId, followeeId);
        followCountUpdatedPublisher.publish(event);
    }
}
