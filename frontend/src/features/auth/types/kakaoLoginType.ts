export interface KakaoLoginRequest {
    authorizationCode: string;
    deviceToken: string | null;
}