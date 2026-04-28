import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

//로그인한 사용자는 "/" 경로로 이동 관리
const PublicRoute = () => {
    //[전역 상태 가져오기]
    const isLoading = useAuthStore((state) => state.isLoading);
    const accessToken = useAuthStore((state) => state.accessToken);

    if(isLoading){
        return null;
    }

    //이미 로그인한 사용자는 "/" 로 이동
    if(accessToken){
        return <Navigate to = "/" replace/>;
    }

    //로그인 안 된 사람은 로그인, 회원가입 등으로 이동
    return <Outlet/>;
};

export default PublicRoute;