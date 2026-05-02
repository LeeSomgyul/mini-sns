import api from "../../../api/axios";
import type { ApiResponse } from "../../../common/types/commonType";
import type { NicknameCheckResponse } from "../../../types/user/nicknameCheck";
import type { EmailSendRequest, EmailSendResponse } from "../../../types/mail/emailSend";
import type { EmailVerifyRequest, EmailVerifyResponse } from "../../../types/mail/emailVerify";
import type { JoinRequest, JoinResponse } from "../types/join";


export const authApi = {
    //닉네임 중복체크
    checkNickName: async(nickname: string) => {
        const response = await api.get<ApiResponse<NicknameCheckResponse>>(
            `/api/v1/users/nickname/exists?nickname=${nickname}`
        );
        return response.data.data;
    },
    //이메일 인증번호 전송
    emailSend: async(request: EmailSendRequest) => {
        const response = await api.post<ApiResponse<EmailSendResponse>>(
            '/api/v1/auth/email/send',
            request
        );
        return response.data.data;
    },
    //이메일 인증번호 검증
    emailVerify: async(request: EmailVerifyRequest) => {
        const response = await api.post<ApiResponse<EmailVerifyResponse>>(
            '/api/v1/auth/email/verify',
            request
        );
        return response.data.data;
    },
    //회원가입
    join: async (request: JoinRequest) => {
        const response = await api.post<ApiResponse<JoinResponse>>(
            '/api/v1/auth/join',
            request
        );
        return response.data.data;
    },
}