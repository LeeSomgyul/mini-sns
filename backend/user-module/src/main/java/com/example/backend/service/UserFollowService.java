package com.example.backend.service;

import com.example.backend.dto.response.FollowUserResponse;
import com.example.backend.entity.Follow;
import com.example.backend.entity.User;
import com.example.backend.exception.InvalidRequestException;
import com.example.backend.exception.NotFoundException;
import com.example.backend.repository.FollowRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserFollowService {

    public final UserRepository userRepository;
    public final FollowRepository followRepository;

    // [팔로잉 목록 조회] ID 가 userId인 사용자의 팔로잉 목록 조회
    @Transactional(readOnly = true)
    public FollowUserResponse getFollowings(Long userId, Long cursor, int size){
        // [예외] 조회 대상 존재 확인
        if(!userRepository.existsById(userId)){
            throw new NotFoundException("존재하지 않는 사용자입니다.");
        }

        // [무한스크롤]
        // 한번에 가져올 데이터 size 정하기. (20개를 한번에 조회할거면 +1)
        Pageable pageable = PageRequest.of(0, size+1);

        // 특정 유저를 팔로우(상대방이 나를 신청한)하는 유저 목록 조회
        List<Object[]> results = followRepository.findFollowingsByUserId(userId, cursor, pageable);

        return convertToFollowUserResponse(results, size);
    }

    // [팔로우 목록 조회] ID 가 userId인 사용자의 팔로우 목록 조회
    @Transactional(readOnly = true)
    public FollowUserResponse getFollowers(Long userId, Long cursor, int size){
        // [예외] 조회 대상 존재 확인
        if(!userRepository.existsById(userId)){
            throw new NotFoundException("존재하지 않는 사용자입니다.");
        }

        // [무한스크롤]
        // 한번에 가져올 데이터 size 정하기. (20개를 한번에 조회할거면 +1)
        Pageable pageable = PageRequest.of(0, size+1);

        // 특정 유저를 팔로우(상대방이 나를 신청한)하는 유저 목록 조회
        List<Object[]> results = followRepository.findFollowersByUserId(userId, cursor, pageable);

        return convertToFollowUserResponse(results, size);
    }


    // [공통 메서드]
    // 팔로워 및 팔로잉 목록 조회 & 무한스크롤
    private FollowUserResponse convertToFollowUserResponse(List<Object[]> results, int size){
        // 다음 페이지 존재 여부 확인
        boolean hasNextPage = results.size() > size;
        List<Object[]> slicedResults = hasNextPage
                ? results.subList(0, size)
                : results;

        // 다음 커서 값 추출 (다음 페이지는 무슨 userId 부터 시작해야 할지)
        Long nextCursor = null;
        if(!slicedResults.isEmpty()){
            Object[] lastRow = slicedResults.get(slicedResults.size() - 1);
            Follow lastFollow = (Follow) lastRow[0];
            nextCursor = lastFollow.getId();
        }

        // [Response 응답]
        List<FollowUserResponse.FollowContentDto> content = slicedResults.stream()
                .map(row -> {
                    if(row[1] instanceof User user){
                        return FollowUserResponse.FollowContentDto.of(
                                user.getId(),
                                user.getNickname(),
                                user.getName(),
                                user.getProfileImageUrl()
                        );
                    }
                    throw new InvalidRequestException("조회된 데이터가 User 타입이 아닙니다. 쿼리를 확인해주세요.");
                })
                .toList();

        return FollowUserResponse.of(content, nextCursor, hasNextPage);
    }
}
