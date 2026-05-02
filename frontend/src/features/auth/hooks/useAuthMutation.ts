import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/authApi";
import type { EmailSendRequest } from "../../../types/mail/emailSend";
import type { EmailVerifyRequest } from "../../../types/mail/emailVerify";



//---폼을 통해 입력받은 데이터를 -> 백엔드가 원하는 형태(JoinRequest)로 매핑

//[닉네임 중복체크]
export const useCheckNickNameMutation = () => {
    return useMutation({
        mutationFn: (nickname: string) => authApi.checkNickName(nickname),
    });
};

//[이메일 인증번호 전송]
export const useEmailSendMutation = () => {
    return useMutation({
        mutationFn: (request: EmailSendRequest) => authApi.emailSend(request),
    });
};

//[이메일 인증번호 검증]
export const useEmailVerifyMutation = () => {
    return useMutation({
        mutationFn: (request: EmailVerifyRequest) => authApi.emailVerify(request),
    });
};



