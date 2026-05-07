import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../api/loginApi";
import { useAuthStore } from "../store/authStore";
import { getDeviceToken } from "../../../firebase";
import { ROUTES } from "../../../constants/routes";

export const useKakaoLoginMutation = () => {
    const navigate = useNavigate();
    const setAccessToken = useAuthStore((state) => state.setAccessToken);

    return useMutation({
        mutationFn: async (authorizationCode: string) => {
            const deviceToken = await getDeviceToken();
            const requestData = { authorizationCode, deviceToken };
            
            return loginApi.kakaoLogin(requestData);
        },
        onSuccess: (response) => {
            const token = response.accessToken; 
            setAccessToken(token);
            navigate(ROUTES.FEED, { replace: true });
        },
        onError: (error) => {
            console.error("카카오 로그인 실패:", error);
            navigate(ROUTES.LOGIN, { replace: true });
        },
        meta: {
            disableGlobalError: true,
        }
    });
};