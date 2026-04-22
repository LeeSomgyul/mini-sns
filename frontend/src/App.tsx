import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from "./context/AuthContext";
import { LoginPage, JoinPage, FeedPage, ProfilePage } from "./pages/index";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Layout from "./Layout";
import { ROUTES } from "./constants/routes";
import KakaoCallback from "./pages/KakaoCallback";

function App() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}

export default App;