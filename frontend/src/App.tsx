import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { LoginPage, JoinPage, FeedPage, ProfilePage } from "./pages/index";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Layout from "./Layout";
import { ROUTES } from "./constants/routes";
import KakaoCallback from "./pages/KakaoCallback";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";

function App() {

  const isLoading = useAuthStore((state) => state.isLoading);
  const pageRefresh = useAuthStore((state) => state.pageRefresh);

  //앱이 켜질 때 토큰 발급
  useEffect(() => {
    pageRefresh();
  },[pageRefresh]);

  //토큰 재발급 기다리는 동안
  if(isLoading){
    return <div>로그인 정보를 확인 중입니다...</div>;
  }

  return (
    <>
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          style: {fontSize: '15px', color: "black", maxWidth: 'none', whiteSpace: 'nowrap'}
        }}
      />
      <BrowserRouter>
        <Routes>
          {/* 퍼블릭 라우터: 로그인 안해도 들어갈 수 있는 라우터 */}
          <Route element={<PublicRoute/>}>
            <Route path={ROUTES.LOGIN} element={<LoginPage/>}/>
            <Route path={ROUTES.JOIN} element={<JoinPage/>}/>
            <Route path={ROUTES.KAKAOLOGIN} element={<KakaoCallback/>}/>
          </Route>
          
          {/* 프라이빗 라우터: 로그인 해야 들어갈 수 있는 라우터 */}
          <Route element={<ProtectedRoute/>}>
            <Route path={ROUTES.FEED} element={<Layout/>}>
              <Route index element={<FeedPage/>}/>
              <Route path={ROUTES.PROFILE('userId')} element={<ProfilePage/>}/>{/* 🚨🚨userId 작업하기🚨🚨 */}
            </Route>
          </Route>

          {/* 예외 처리: 이상한 주소로 들어오면 로그인 페이지로 보냄 */}
          <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />}/>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;