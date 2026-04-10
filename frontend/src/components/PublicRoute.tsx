import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

//로그인한 사용자는 "/" 경로로 이동 관리
const PublicRoute = () => {
    const auth = useContext(AuthContext);

    //인증 정보 없는 사용자 이동
    if(!auth){
        <Outlet/>
    }

    if(auth?.isLoading){
        return null;
    }

    //이미 로그인한 사용자는 "/" 로 이동
    if(auth?.accessToken){
        return <Navigate to = "/" replace/>;
    }

    //로그인 안 된 사람은 로그인, 회원가입 등으로 이동
    return <Outlet/>;
};

export default PublicRoute;