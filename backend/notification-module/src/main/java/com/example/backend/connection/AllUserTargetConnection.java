package com.example.backend.connection;

import com.example.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

//[친구 추가 기능 미완성으로 인한 알림 대상자 찾기 임시 구현체]
// - 어떤 작성자가 게시물 작성하면 모든 사용자에게 알림 넣기
@Component
@RequiredArgsConstructor
public class AllUserTargetConnection implements NotificationTargetConnection{

    private final UserRepository userRepository;

    @Override
    public List<Long> findTargetUserIds(Long actorId) {
        return userRepository.findAllIdsExcept(actorId);
    }
}
