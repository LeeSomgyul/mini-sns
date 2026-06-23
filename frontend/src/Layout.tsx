import { Outlet } from "react-router-dom";
import Navigation from "./common/components/Navigation";
import { GlobalModalProvider } from "./common/provider/GlobalModalProvider";

// [네비게이션]
// 모든 페이지에서 공통으로 보이는 틀 지정 
const Layout = () => {
    return(
        <div className="layout-container">
            {/* 좌측 네비게이션 영역 (Navigation.tsx) */}
            <nav className="layout-nav">
                <Navigation/>
            </nav>

            {/* 우측 본문 영역 (주소에 따라 달라짐) */}
            <div className="layout-main">
                <Outlet/>
            </div>

            {/* 전역 모달 상태 - 모달은 모든 화면의 최상단 위치 */}
            <GlobalModalProvider/>
        </div>
    );
};

export default Layout;