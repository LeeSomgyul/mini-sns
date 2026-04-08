import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    const auth = useContext(AuthContext);//전역 인증 상태 가져오기(로그인 유무)

    //인증 상태가 null이거나 accessToken이 없다면 로그인 페이지로 이동 
    if(!auth?.accessToken){
        return <Navigate to="/login" replace />
    };

    return <Outlet/>;
};

export default ProtectedRoute;