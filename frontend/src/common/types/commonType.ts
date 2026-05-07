//백엔드에서 response 담는 큰 바구니
export interface ApiResponse<T>{
    status: string;
    message: string;
    data: T;
}