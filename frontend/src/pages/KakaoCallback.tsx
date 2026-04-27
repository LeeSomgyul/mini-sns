import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { ROUTES } from "../constants/routes";
import { getDeviceToken } from "../firebase";
import api from '../api/axios';
import {useAuthStore} from "../store/authStore";

//카카오 로그인 이후 정보 가져오는 페이지
const KakaoCallback = () => {

    const setAccessToken = useAuthStore((state) => state.setAccessToken);

    const navigate = useNavigate();
    const isProcessed = useRef(false);//카카오 code 사용 여부 

    useEffect(() => {
        //code를 이미 사용했다면 아무것도 안함(카카오 code는 2번 사용 안됨)
        if(isProcessed.current) return;

        //code 사용 시작(카카오 로그인 페이지로 이동 시작)
        isProcessed.current = true;

        const processKakaoLogin = async () => {
            //url로 준 code만 뽑아내기
            const code = new URL(window.location.href).searchParams.get("code");

            if(!code){
                alert("카카오 로그인 코드를 찾을 수 없습니다.");
                navigate(ROUTES.LOGIN);
                return;
            }

            try{
                const deviceToken = await getDeviceToken();

                const request = {
                    authorizationCode: code,
                    deviceToken: deviceToken
                };

                const response = await api.post('/api/v1/auth/kakao', request);

                if(response.status === 200){
                    const token = response.data.data.accessToken;
                    setAccessToken(token);
                    navigate(ROUTES.FEED, {replace:true});
                }

                console.log("카카오에서 받아온 코드: ", code);
            }catch(error){
                console.log("카카오 로그인 실패: ", error);
                navigate(ROUTES.LOGIN);
            }
        };

        processKakaoLogin();
    },[navigate]);


    return(
        <div>
            <h2>카카오 로그인 처리 중입니다...</h2>
        </div>
    );
};

export default KakaoCallback;