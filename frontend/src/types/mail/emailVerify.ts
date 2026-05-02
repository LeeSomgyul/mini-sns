export interface EmailVerifyRequest{
    email: string;
    code: string;
}

export interface EmailVerifyResponse{
    verifyToken: string;
}
