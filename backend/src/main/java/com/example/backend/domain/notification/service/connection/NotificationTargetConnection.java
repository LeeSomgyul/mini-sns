package com.example.backend.domain.notification.service.connection;

import java.util.List;

// [친구 기반 & 전체 공지 분기]
// 현재: 친구 추가 기능 미완성으로 어떤 사용자든 게시물 작성되면 알림 받기
// 나중에 수정: 친구 추가 기능 완성 & 친구 테이블 생성 후 AllUserTargetConnection.java제거 후 변경
public interface NotificationTargetConnection {

    // 글쓴이(actorId)를 제외한 알림을 받아야 하는 사용자 id 목록 반환
    List<Long> findTargetUserIds(Long actorId);
}
