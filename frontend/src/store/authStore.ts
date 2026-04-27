import {create} from 'zustand';
import api from "../api/axios";


interface AuthState{
    accessToken: string | null;
    isLoading: boolean;
    setAccessToken: (token: string | null) => void;
    logout: () => void;
    pageRefresh: () => Promise<void>;
}

//[전역 상태 관리]: accessToken
export const useAuthStore = create<AuthState>((set) => ({
    //[초기값] 토큰
    accessToken: null,

    //[초기값] api로 요청 상태
    isLoading: true,

    //[함수] 토큰 저장
    setAccessToken: (token) => set({accessToken: token}),

    //[함수] 로그아웃
    logout: () => set({accessToken: null}),

    //[함수] 새로고침
    pageRefresh: async() => {
        try{
            const response = await api.post('/api/v1/auth/reissue');
            set({accessToken: response.data.data.accessToken});
            }catch(error){
                set({accessToken: null});
            }finally{
                set({isLoading: false});
            }
    }
}));