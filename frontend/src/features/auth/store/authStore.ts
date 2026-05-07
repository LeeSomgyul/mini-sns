import { create } from 'zustand';

interface AuthState {
    accessToken: string | null;
    setAccessToken: (token: string | null) => void;
    logout: () => void;
}

// [accessToken 관리]
export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    
    // 토큰 저장
    setAccessToken: (token) => set({ accessToken: token }),

    // 토큰 버리기 (로그아웃)
    logout: () => set({ accessToken: null }),
}));