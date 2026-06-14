export const notificationApi ={
    // 1.실시간 알림 파이프라인(SSE) 구독
    // - 로그인 후 피드 화면으로 사용자가 들어오면 작동됨
    subscribeNewFeed: (accessToken: string|null): EventSource => {
        if(!accessToken){
            throw new Error("[SSE] 인증 토큰이 없어 실시간 알림을 연결할 수 없습니다.");
        }

        const url = `/api/v1/notifications/connect?token=${encodeURIComponent(accessToken)}`;
        return new EventSource(url);
    }
};