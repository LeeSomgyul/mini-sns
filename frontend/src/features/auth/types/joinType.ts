//[회원가입] 백엔드로 요청
export interface JoinRequest {
    email: string;
    password: string;
    nickname: string;
    name?: string; 
    phoneNumber?: string;
    verificationToken: string;
}

//[회원가입] 백엔드에서 받아오는 데이터
export interface JoinResponse {
    userId: number;
    email: string;
    nickname: string;
}