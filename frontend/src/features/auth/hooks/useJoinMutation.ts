import type { JoinRequest, JoinResponse } from "../types/join";
import type { AxiosError } from "axios";
import type { JoinFormValues } from "../schemas/joinSchema";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/authApi";

type JoinMutationParams = {
    formData: JoinFormValues;
    verificationToken: string;
}

//[회원가입] 
export const useJoinMutation = () => {
    //JoinResponse: 백엔드에서 값 가져오기 성공 시 응답
    //AxiosError: 실패 시 에러처리
    //JoinMutationParams: 입력 폼
    return useMutation<JoinResponse, AxiosError<{message: string}>, JoinMutationParams>({
        mutationFn: ({formData, verificationToken}) => {
            const request: JoinRequest = {
                email: formData.email,
                password: formData.password,
                nickname: formData.nickname,
                name: formData.name,
                phoneNumber: formData.phoneNumber,
                verificationToken: verificationToken,
            };

            return authApi.join(request);
        },
    });
};