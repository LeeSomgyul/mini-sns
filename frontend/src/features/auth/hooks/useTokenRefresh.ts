import { useQuery } from "@tanstack/react-query";
import { reissueTokenApi } from "../api/reissueTokenApi";
import { useAuthStore } from "../store/authStore";

//[토큰 갱신]
//기존 accessToken이 유효한지 확인 후, 새 토큰을 받아서 로그인을 유지
export const useTokenRefresh = () => {
    //토큰 저장 함수(setAccessToken) 가져오기
    const setAccessToken = useAuthStore((state) => state.setAccessToken);

    //토큰 재발급 요청
    const { isLoading, isError } = useQuery({
        queryKey: ["auth", "reissue"],
        queryFn: async () => {
            try{
                //새로운 토큰 요청
                const data = await reissueTokenApi.reissueToken();
                //서버가 준 새로운 토큰 저장
                setAccessToken(data.accessToken); 
                return data;
            }catch{
                setAccessToken(null);
                return null;
            }
        },
        // 토큰 재발급 실패 시 재시도 안함
        retry: false, 
        // 서버 재요청 안함
        refetchOnWindowFocus: false, 
    });

    //프론트에 상태 전달
    return {
        isAuthLoading: isLoading, //토큰 확인중인가?
        isError//어떤 에러가 있나?
    };
};