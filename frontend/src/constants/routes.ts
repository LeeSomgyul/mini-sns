//프론트 페이지 이동 라우터
export const ROUTES = {
    FEED: '/',
    LOGIN: '/login',
    KAKAOLOGIN: '/login/kakao',
    JOIN: '/join',
    PROFILE: {
        PATH: '/profile/:userId',
        LINK: (userId: string | number) => `/profile/${userId}` 
    }
};