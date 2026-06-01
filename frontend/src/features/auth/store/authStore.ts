import { create } from 'zustand';

interface AuthState {
    accessToken: string | null;
    myUserId: number | null;
    setAccessToken: (token: string | null) => void;
    setMyUserId: (id: number | null) => void;
    logout: () => void;
}

// [전역 상태] 현재 로그인한 사용자의 정보를 전역에서 사용 가능
export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    myUserId: null,
    
    // 토큰 저장
    setAccessToken: (token) => set({ accessToken: token }),

    // 사용자 id 저장
    setMyUserId: (id) => set({myUserId: id}),

    // 토큰 버리기 (로그아웃)
    logout: () => set({ accessToken: null, myUserId: null }),
}));