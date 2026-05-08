import { BrowserRouter, Routes, Route, Navigate, createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { LoginPage, JoinPage, FeedPage, ProfilePage } from "./pages/index";
import ProtectedRoute from "./common/components/ProtectedRoute";
import PublicRoute from "./common/components/PublicRoute";
import Layout from "./Layout";
import { ROUTES } from "./constants/routes";
import KakaoCallback from "./features/auth/pages/KakaoCallbackPage";
import { useTokenRefresh } from "./features/auth/hooks/useTokenRefresh";

// [라우터 객체 선언] (react-router-dom ver.6 이상): 기존 <BrowserRouter> 대체
const router = createBrowserRouter([
  // 퍼블릭 라우터: 로그인 안해도 접근 가능
  {
    element: <PublicRoute/>,
    children: [
      {path: ROUTES.LOGIN, element: <LoginPage/>},
      {path: ROUTES.JOIN, element: <JoinPage/>},
      {path: ROUTES.KAKAOLOGIN, element: <KakaoCallback/>},
    ],
  },
  // 프라이빗 라우터: 로그인 해야 접근 가능
  {
    element: <ProtectedRoute/>,
    children: [
      {path: ROUTES.FEED, element: <Layout/>,
        children: [
          {index: true, element: <FeedPage/>},
          {path: ROUTES.PROFILE('userId'), element: <ProfilePage/>}//🚨🚨userId 작업하기🚨🚨
        ],
      },
    ],
  },
  // 예외 처리: 잘못된 주소
  {
    path: "*",
    element: <Navigate to={ROUTES.LOGIN} replace/>,
  },
]);

function App() {
  const { isLoading } = useTokenRefresh();

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
      <RouterProvider router={router}/>
    </>
  );
}

export default App;