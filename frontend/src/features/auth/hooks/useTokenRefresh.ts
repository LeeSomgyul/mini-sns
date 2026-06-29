import { useAuthStore } from '../store/authStore';
import { reissueTokenApi } from '../api/reissueTokenApi';
import { useEffect, useRef, useState } from 'react';

// [토큰 없음 수동 방어]
// 앱이 처음 켜질 때(새로고침), 가장 먼저 딱 1번 인증 환경을 깔끔하게 세팅해 주는 역할.
export const useTokenRefresh = () => {
    const {setAccessToken, logout } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);
    const hasInitialized = useRef(false);

    useEffect(() => {
        // 이미 실행 중이라면 중복 실행 차단
        if(hasInitialized.current) return;
        hasInitialized.current = false;

        const initAuth = async () => {
            // 1. 토큰 가져오기
            const currentToken = useAuthStore.getState().accessToken;

            // 2. 이미 메모리(Zustand)에 accessToken이 있다면 토큰 재발급X 및 로딩 종료
            if(currentToken){
                setIsLoading(false);
                return;
            }

            // 3. accessTokne이 없다면 refreshToken 사용해서 토큰 재발급 시도
            try{
                const data = await reissueTokenApi.reissueToken();
                setAccessToken(data.accessToken);
            }catch(error){
                logout();
            }finally{
                setIsLoading(false);
            }
        };

        initAuth();
    },[setAccessToken, logout]);

    return {isLoading};
};