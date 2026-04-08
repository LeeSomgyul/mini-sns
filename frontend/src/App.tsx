import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import { LoginPage, JoinPage, FeedPage, ProfilePage } from "./pages/index";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./Layout";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 퍼블릭 라우터: 로그인 안해도 들어갈 수 있는 라우터 */}
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/join" element={<JoinPage/>}/>

          {/* 프라이빗 라우터: 로그인 해야 들어갈 수 있는 라우터 */}
          <Route element={<ProtectedRoute/>}>
            <Route path="/" element={<Layout/>}>
              <Route index element={<FeedPage/>}/>
              <Route path="/profile/:id" element={<ProfilePage/>}/>{/* 🚨🚨:id 작업하기🚨🚨 */}
            </Route>
          </Route>

          {/* 예외 처리: 이상한 주소로 들어오면 로그인 페이지로 보냄 */}
          <Route path="*" element={<Navigate to="/login" replace />}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;