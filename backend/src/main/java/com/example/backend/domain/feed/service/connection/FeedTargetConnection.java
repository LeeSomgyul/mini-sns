package com.example.backend.domain.feed.service.connection;

import java.util.List;

/*
* 피드에서 '글 작성 시점(Write)'과 '피드 조회 시점(Read)'에
* 어떤 사용자들의 네트워크 연결을 해야하는지 결정하는 역할.
* - 일반 사용자: Write 시점에 팔로워들에게 데이터를 꽂아주는 Push 수행
* - 인플루언서 사용자: Read 시점에 팔로잉하는 사용자가 DB에서 직접 데이터를 가져오는 Pull수행
*
* 🚨추후 'friendships(친구 관계)' 테이블 및 도메인이 완성되면,
* 🚨SystemWideTargetConnection.java 생성 후 연결 예정
*/
public interface FeedTargetConnection {
    //[Push 대상 조회] 일반 사용자가 글을 작성한 직후 호출되는 메서드
    /*
    * @param authorId: 글을 작성한 일반 사용자의 고유 ID
    * @return 데이터를 실시간으로 Push 받을 팔로워들의 ID 리스트
    */
    List<Long> feedPushTargetIds(Long authorId);

    //[Pull 대상 조회] 어떤 사용자가 자신의 피드를 새로고침 한는 순간 호출되는 메서드
    /*
     * @param currentUserId: 피드를 조회하고 있는 현재 로그인한 사용자의 고유 ID
     * @return 내가 팔로우 중인 인플루언서들의 ID 리스트
     */
    List<Long> feedPullTargetIds(Long currentUserId);
}
