import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import JoinPage from "./pages/JoinPage";

function App() {

  //LoginPage와 JoinPage 쉽게 이동할 수 있도록 path추가 🚨🚨삭제 예정🚨🚨
  const path = window.location.pathname;

  return (
    <AuthProvider>
      {/*임시 경로, 🚨🚨삭제 예정🚨🚨*/}
      {path === '/join' ? <JoinPage/> : <LoginPage/>}
    </AuthProvider>
  );
}

export default App;