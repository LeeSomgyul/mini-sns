import { useMutation } from "@tanstack/react-query"
import type { LoginRequest, LoginResponse } from "../types/loginType"
import type { AxiosError } from "axios"
import type {LoginFormValues} from "../schemas/loginSchema";
import { getDeviceToken } from "../../../firebase";
import { loginApi } from "../api/loginApi";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { ROUTES } from "../../../constants/routes";

export const useLoginMutation = () => {
    const navigate = useNavigate();
    const setAccessToken = useAuthStore((state) => state.setAccessToken);

    return useMutation<LoginResponse, AxiosError<{message: string}>, LoginFormValues>({
          mutationFn: async (formData) => {
               const deviceToken = await getDeviceToken();

               const request: LoginRequest = {
                    email: formData.email,
                    password: formData.password,
                    deviceToken: deviceToken
               };

               return loginApi.login(request);
          },
          //로그인 성공 시: accessToken 저장 및 홈 이동
          onSuccess: (response) => {   
               const accessToken = response.accessToken;
               setAccessToken(accessToken);
               navigate(ROUTES.FEED, {replace: true});
          },
          //로그인 실패 시: 개발자 확인용 로그 출력(나머지는 LoginPage.tsx에서)
          onError: (error) => {
               console.error("Login APi 에러: ", error);
          },
          //전역 에러 띄우기 막기
          meta: {
               disableGlobalError: true, 
          }
    });
}