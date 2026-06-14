import { useEffect, useState } from "react"
import { notificationApi } from "../api/notificationApi";
import { useAuthStore } from "../../auth/store/authStore";

interface useNewFeedNotificationProps {
    isNewFeedAvailable: boolean; //지금 화면에 띄울 새로운 피드가 존재하는가?
    resetNotification: () => void; //새 소식 알림 상태 초기화 함수
}

export const useNewFeedNotification = (): useNewFeedNotificationProps => {
    const [isNewFeedAvailable, setIsNewFeedAvailable] = useState<boolean>(false);
    
    const accessToken = useAuthStore((state) => state.accessToken);

    useEffect(() => {
        if(!accessToken) return;

        const eventSource = notificationApi.subscribeNewFeed(accessToken);

        eventSource.onopen = () => {
            console.log(`[SSE] 실시간 알림 파이프라인 연결 성공`);
        };

        // 백엔드의 'NEW_POST' 응답이 오면 새로운 피드가 있다는 의미
        eventSource.addEventListener('NEW_POST', (event: MessageEvent) => {
            console.log('[SSE] 새 게시글 작성 이벤트 수신:', event.data);
            setIsNewFeedAvailable(true);
        });

        // Nginx 재연결 응답
        eventSource.addEventListener('NGINX_PING', (event: MessageEvent) => {
            console.log('[SSE] Nginx 재연결 응답:', event.data);
        });

        // 오류 메시지 콘솔에서 숨기기 
        eventSource.onerror = (error) => {
            if(eventSource.readyState === EventSource.CONNECTING){
                console.log('[SSE] 세션 만료로 인한 자동 재연결 시도 중...');
            }else{
                console.error('[SSE] 연결 오류 발생:', error);
            }            
        };

        // SSE 연결 종료
        return () => {
            eventSource.close();
            console.log(`[SSE] 실시간 알림 파이프라인 정리 완료`);
        };
    }, [accessToken])

    const resetNotification = () => {
        setIsNewFeedAvailable(false);
    };

    // NotificationBanner 화면으로 전달
    return {isNewFeedAvailable, resetNotification};
}