import { useAuthStore } from "../../features/auth/store/authStore";
import { Navigate, Outlet } from "react-router-dom";

//로그인하지 않은 사용자는 못 들어가는 경로 관리 
const ProtectedRoute = () => {
    const accessToken = useAuthStore((state) => state.accessToken);

    //인증 상태가 null이거나 accessToken이 없다면 로그인 페이지로 이동 
    if(!accessToken){
        return <Navigate to="/login" replace />
    };

    return <Outlet/>;
};

export default ProtectedRoute;