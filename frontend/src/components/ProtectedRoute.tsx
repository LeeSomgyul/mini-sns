import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

//로그인하지 않은 사용자는 못 들어가는 경로 관리 
const ProtectedRoute = () => {
    const auth = useContext(AuthContext);//전역 인증 상태 가져오기(로그인 유무)

    if(!auth){
        return <Navigate to="/login" replace/>;
    }

    //토큰 불러오느라 로딩중이라면(새로고침, 로그인 시)
    if(auth?.isLoading){
        return null;
    }

    //인증 상태가 null이거나 accessToken이 없다면 로그인 페이지로 이동 
    if(!auth?.accessToken){
        return <Navigate to="/login" replace />
    };

    return <Outlet/>;
};

export default ProtectedRoute;