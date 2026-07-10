// [백엔드 응답 공통 type]
// api 응답 성공 
export interface ApiResponse<T>{
    status: string;
    message: string;
    data: T;
}

// api 응답 실패
export interface ErrorResponse{
    status: string;
    message: string;
    timestamp: string;
}