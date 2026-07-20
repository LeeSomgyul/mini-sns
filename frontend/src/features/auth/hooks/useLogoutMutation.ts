import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom";
import { logoutApi } from "../api/logoutApi";
import type { AxiosError } from "axios";
import type { ErrorResponse } from "../../../common/types/commonType";
import { useAuthStore } from "../store/authStore";
import { ROUTES } from "../../../constants/routes";

interface LogoutMutationProps{
    closeModal: () => void;
}

export const useLogoutMutation = ({closeModal}: LogoutMutationProps) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);

    return useMutation({
        // [api] 로그아웃 요청
        mutationFn: logoutApi.logout,

        // 로그아웃 성공 시 실행
        onSuccess: () => {
            queryClient.clear();

            logout();
            
            if(closeModal) closeModal();

            navigate(ROUTES.LOGIN, {replace: true});
        },

        // 로그아웃 실패 시 실행
        onError: (error: AxiosError<ErrorResponse>) => {
            console.log("로그아웃 실패: ", error);
            queryClient.clear();
            logout();
            if(closeModal) closeModal();
            navigate(ROUTES.LOGIN, {replace: true});
        }
    });
}