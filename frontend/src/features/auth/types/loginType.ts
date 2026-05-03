//[로그인] 백엔드로 요청
export interface LoginRequest{
    email: string;
    password: string;
    deviceToken: string | null;
}

//[로그인] 백엔드 응답
export interface LoginResponse{
    userId: number;
    nickname: string;
    accessToken: string;
    expiresIn: number;
}