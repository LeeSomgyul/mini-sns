import { Outlet } from "react-router-dom";
import Navigation from "./components/Navigation";

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
        </div>
    );
};

export default Layout;