export const ROUTES = {
    FEED: '/',
    LOGIN: '/login',
    JOIN: '/join',
    PROFILE: (id: string | ':id') => `/profile/${id}`,
};