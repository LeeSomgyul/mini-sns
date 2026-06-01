import { create } from 'zustand';

interface AuthState {
    accessToken: string | null;
    myUserId: number | null;
    myNickname: string | null;
    myProfileImageUrl: string | null;
    setAccessToken: (token: string | null) => void;
    setMyUserId: (id: number | null) => void;
    setMyNickname : (nickname: string | null) => void;
    setMyProfileImageUrl: (url: string | null) => void;
    logout: () => void;
}

// [전역 상태] 현재 로그인한 사용자의 정보를 전역에서 사용 가능
export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    myUserId: null,
    myNickname: null,
    myProfileImageUrl: null,
    
    setAccessToken: (token) => set({ accessToken: token }),
    setMyUserId: (id) => set({myUserId: id}),
    setMyNickname: (nickname) => set({myNickname: nickname}),
    setMyProfileImageUrl: (url) => set({myProfileImageUrl: url}),

    logout: () => set({ accessToken: null, myUserId: null }),
}));