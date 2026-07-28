import { Outlet } from "react-router-dom";
import Navigation from "./common/components/Navigation";
import { GlobalModalProvider } from "./common/provider/GlobalModalProvider";

// [네비게이션]
// 모든 페이지에서 공통으로 보이는 틀 지정
const Layout = () => {
    return(
        <div className="relative min-h-screen">
            {/* 오로라 키 컬러 배경 장식 */}
            <div
                className="pointer-events-none fixed inset-0 -z-10 opacity-70 blur-3xl"
                style={{
                    background: `
                        radial-gradient(circle at 8% 10%, rgba(92,200,241,0.25), transparent 40%),
                        radial-gradient(circle at 92% 8%, rgba(247,220,163,0.28), transparent 42%),
                        radial-gradient(circle at 15% 90%, rgba(214,222,159,0.25), transparent 42%),
                        radial-gradient(circle at 88% 85%, rgba(238,199,211,0.28), transparent 42%),
                        #f2f2f3
                    `
                }}
            />

            {/* 상단 고정 헤더 바 */}
            <header className="fixed top-0 inset-x-0 z-50 h-16 bg-white flex items-center px-8 border-b border-black/5">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#5cc8f1] to-[#eec7d3]" />
                    <span className="text-lg font-semibold text-[#2b2b31]">Mini SNS</span>
                </div>
            </header>

            <div className="flex justify-center gap-7 max-w-[1250px] mx-auto px-4">
                {/* 좌측 네비게이션 영역 (Navigation.tsx) */}
                <nav className="w-20 shrink-0 sticky top-0 h-screen pt-24 pb-6 flex flex-col items-center gap-5">
                    <Navigation/>
                </nav>

                {/* 우측 본문 영역 (주소에 따라 달라짐) */}
                <div className="flex-1 min-w-0 pt-16">
                    <Outlet/>
                </div>
            </div>

            {/* 전역 모달 상태 - 모달은 모든 화면의 최상단 위치 */}
            <GlobalModalProvider/>
        </div>
    );
};

export default Layout;
