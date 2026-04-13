export const ROUTES = {
    FEED: '/',
    LOGIN: '/login',
    KAKAOLOGIN: '/login/kakao',
    JOIN: '/join',
    PROFILE: (id: string | ':id') => `/profile/${id}`
    
};