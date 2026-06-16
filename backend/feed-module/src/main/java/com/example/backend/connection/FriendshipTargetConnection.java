package com.example.backend.connection;

import com.example.backend.domain.user.entity.User;
import com.example.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class FriendshipTargetConnection implements FeedTargetConnection{

    private final UserRepository userRepository;

    //[Push 대상 조회] 일반 사용자가 글을 작성한 직후 호출되는 메서드
    /*
     * @param authorId: 글을 작성한 일반 사용자의 고유 ID
     * @return 데이터를 실시간으로 Push 받을 팔로워들의 ID 리스트(🚨현재는 모든 ID 반환중🚨)
     */
    @Override
    public List<Long> feedPushTargetIds(Long authorId) {
        return userRepository.findAll().stream()
                .map(User::getId)
                .toList();
    }

    //[Pull 대상 조회] 어떤 사용자가 자신의 피드를 새로고침 한는 순간 호출되는 메서드
    /*
     * @param currentUserId: 피드를 조회하고 있는 현재 로그인한 사용자의 고유 ID
     * @return 내가 팔로우 중인 인플루언서들의 ID 리스트(🚨현재는 모든 ID 반환중🚨)
     */
    @Override
    public List<Long> feedPullTargetIds(Long currentUserId) {
        return userRepository.findByIsCelebrityTrue().stream()
                .map(User::getId)
                .toList();
    }
}
