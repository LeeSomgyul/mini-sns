import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { reissueTokenApi } from '../api/reissueTokenApi';
import { AUTH_KEYS } from '../../../constants/queryKey';

// 새로고침 시 토큰 자동 발급
export const useTokenRefresh = () => {
   
    const { accessToken, setAccessToken, logout } = useAuthStore();

    return useQuery({
        queryKey: AUTH_KEYS.reissue(),
        
        queryFn: async () => {
            try {
                const data = await reissueTokenApi.reissueToken();
                setAccessToken(data.accessToken); 
                return data.accessToken;
            } catch (error) {
                logout();
                throw error; 
            }
        },
        
        // 위 api 요청은 accessToken이 비어있을때만 실행
        enabled: !accessToken, 
        // 재실행 안함
        retry: false, 
        
        // 브라우저 창 탭 이동 시 불필요한 재요청 방지 
        refetchOnWindowFocus: false, 
        
        gcTime: 0,
    });
};