//AccessToken을 페이지 전역에서 사용할 수 있도록 설정 
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthContextType } from '../types/authType';
import api from "../api/axios";

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
                    setAccessToken(null);//토큰 없으면(만료되면) 로그인으로 이동
            }finally{
                setIsLoading(false);
            }
        };

        pageRefresh();
    }, []);

    const logout = () => {
        setAccessToken(null);
    };

    return(
        <AuthContext.Provider value={{accessToken, setAccessToken, isLoading, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

//null타입 검증
export const useAuth = () => {
    const context = useContext(AuthContext);
    if(!context){
        throw new Error("userAuth는 반드시 AuthProvider 안에서 사용해야합니다.");
    }
    return context;//null이 아닌 안전한 객체만 반환
}