import { useMutation, useQueryClient } from "@tanstack/react-query";
import { withdrawApi } from "../api/withdrawApi";
import type { AxiosError } from "axios";
import type { ApiResponse, ErrorResponse } from "../../../common/types/commonType";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants/routes";
import { useAuthStore } from "../store/authStore";


interface WithdrawMutationProps{
    onSuccess: (data: ApiResponse<null>) => void;
    onError: (error: AxiosError<ErrorResponse>) => void;
}

export const useWithdrawMutation = ({onSuccess, onError}: WithdrawMutationProps) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);
    
    return useMutation({
        // [api] 회원 탈퇴 요청
        mutationFn: withdrawApi.userWithdraw,

        // [성공 시 실행]
        onSuccess: (data: ApiResponse<null>) => {

            // 프론트엔드로 백엔드에서 전해준 성공 메시지 전달
            if(onSuccess) onSuccess(data);

            logout();
            
            // 모든 캐시 값 초기화
            queryClient.clear();

            navigate(ROUTES.LOGIN);
        },

        // [실패 시 실행]
        onError:(error: AxiosError<ErrorResponse>) => {
            console.log("회원 탈퇴 실패: ", error);
            
            // 프론트엔드로 백엔드에서 전해준 실패 메시지 전달
            if(onError) onError(error);
        },
    });
};