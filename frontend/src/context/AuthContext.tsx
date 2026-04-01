//AccessToken을 페이지 전역에서 사용할 수 있도록 설정 
import { createContext, useState, type ReactNode } from "react";
import type { AuthContextType } from '../types/auth';

//AccessToken을 페이지 전역에 사용
export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({children} : {children : ReactNode}) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);

    return(
        <AuthContext.Provider value={{accessToken, setAccessToken}}>
            {children}
        </AuthContext.Provider>
    );
};