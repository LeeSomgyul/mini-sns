//AccessToken을 페이지 전역에서 사용할 수 있도록 설정 
import { createContext, useEffect, useState, type ReactNode } from "react";
import type { AuthContextType } from '../types/auth';
import api from "../api/axios";
import { AxiosError } from "axios";

//AccessToken을 페이지 전역에 사용
export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({children} : {children : ReactNode}) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    //앱이 처음 켜질 때 or 새로고침 될 때 실행됨
    useEffect(() => {

        const pageRefresh = async() => {

            try{
                const response = await api.post('/api/v1/auth/reissue');
                setAccessToken(response.data.data.accessToken);
            }catch(error){
                if(error instanceof AxiosError){
                    if(error.response){
                        const status = error.response?.status;

                        if(status === 401){
                            window.alert("로그인 시간이 만료되었어요. 소중한 정보 보호를 위해 다시 한번 로그인해 주세요.");
                        }
                    }

                    setAccessToken(null);//토큰 없으면(만료되면) 로그인으로 이동
                }
            }finally{
                setIsLoading(false);
            }
        };

        pageRefresh();
    }, []);

    return(
        <AuthContext.Provider value={{accessToken, setAccessToken, isLoading}}>
            {children}
        </AuthContext.Provider>
    );
};