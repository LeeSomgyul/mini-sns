import { useMutation } from "@tanstack/react-query";
import { joinApi } from "../api/joinApi";
import type { EmailSendRequest } from "../types/emailSend";
import type { EmailVerifyRequest } from "../types/emailVerify";



//---폼을 통해 입력받은 데이터를 -> 백엔드가 원하는 형태(JoinRequest)로 매핑

//[닉네임 중복체크]
export const useCheckNickNameMutation = () => {
    return useMutation({
        mutationFn: (nickname: string) => joinApi.checkNickName(nickname),
    });
};

//[이메일 인증번호 전송]
export const useEmailSendMutation = () => {
    return useMutation({
        mutationFn: (request: EmailSendRequest) => joinApi.emailSend(request),
    });
};

//[이메일 인증번호 검증]
export const useEmailVerifyMutation = () => {
    return useMutation({
        mutationFn: (request: EmailVerifyRequest) => joinApi.emailVerify(request),
    });
};



