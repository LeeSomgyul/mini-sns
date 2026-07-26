import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../api/loginApi";
import { useAuthStore } from "../store/authStore";
import { getDeviceToken } from "../../../firebase";
import { ROUTES } from "../../../constants/routes";

export const useKakaoLoginMutation = () => {
    const navigate = useNavigate();
    const {setMyUserId, setMyNickname, setAccessToken} = useAuthStore();

    return useMutation({
        mutationFn: async (authorizationCode: string) => {
            console.log("3. mutationFn 시작됨! authorizationCode:", authorizationCode);

            console.log("4. getDeviceToken 호출 전");
            const deviceToken = await getDeviceToken();
            console.log("5. getDeviceToken 완료:", deviceToken);
            
            const requestData = { authorizationCode, deviceToken };
            
            return loginApi.kakaoLogin(requestData);
        },
        onSuccess: (response) => {
            console.log("카카오 로그인 성공 응답(raw):", response);
            //로그인 성공 시 유저 정보 전역 저장
            if(response.userId) setMyUserId(response.userId);
            if(response.nickname) setMyNickname(response.nickname);
            if(response.accessToken) setAccessToken(response.accessToken);

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