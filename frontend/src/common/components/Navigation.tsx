import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import type { NavItemType, ModalType } from "../../types/navItemType";
import { ROUTES } from "../../constants/routes";
import {SettingsModal} from "../../pages/SettingsModal";
import {PostFormModal} from "../../features/post/pages/PostFormModal";
import { useAuthStore } from "../../features/auth/store/authStore";
import { usePostModalStore } from "../store/usePostModalStore";

//[아이콘] 홈 (집 모양)
const HomeIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M4 11.5L12 4l8 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6.5 10v8.5a1 1 0 001 1H16.5a1 1 0 001-1V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

//[아이콘] 게시물 작성 (+)
const WriteIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
);

//[아이콘] 프로필 (사람 모양)
const ProfileIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="3.6" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M4.5 20c0-4.1 3.6-6.5 7.5-6.5s7.5 2.4 7.5 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
);

//[아이콘] 설정 (톱니바퀴)
const SettingsIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M19 12a7 7 0 00-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 00-2-1.2L14 3h-4l-.6 2.6a7 7 0 00-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9c.6.5 1.3.9 2 1.2L10 21h4l.6-2.6c.7-.3 1.4-.7 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
);

const NAV_ICONS: Record<string, () => React.JSX.Element> = {
    feed: HomeIcon,
    write: WriteIcon,
    profile: ProfileIcon,
    settings: SettingsIcon,
};

const Navigation = () => {

    const location = useLocation();
    const navigate = useNavigate();

    const [activeModal, setActiveModal] = useState<ModalType>(null);//모달 오픈 유무
    const { myUserId } = useAuthStore();
    const currentUserId = myUserId ?? 0;

    // 게시물 작성/수정 모달이 (수정 버튼 등) 다른 경로로 열렸을 때도 '피드 작성' 아이콘을 활성화하기 위함
    const globalPostModal = usePostModalStore((state) => state.activeModal);

    const NAV_ITEMS: NavItemType[] = [
        {id: 'feed', path: ROUTES.FEED, label: '홈', type: 'link'},
        {id: 'write', path: null, label: '피드 작성', type: 'modal'},
        {id: 'profile', path: ROUTES.PROFILE.LINK(currentUserId), label: '프로필', type: 'link'},
        {id: 'settings', path: null, label: '설정', type: 'modal'}
    ];

    //네비게이션 각 요소 클릭 함수
    const handlePathClick = (item: NavItemType) => {
        //모달을 열어야 하는 경우
        if(item.type === 'modal'){
            setActiveModal(item.id as ModalType);
            return;
        }

        //주소를 열어야 하는 경우(null 즉, 모달이 아닌것만 거르기)
        if(item.path){
            //동일한 위치를 또 들어가려고 할 때 (즉, 이미 /feed인데 또 /feed 라우터 클릭한 경우)
            if(location.pathname === item.path){
                window.scrollTo({top: 0, behavior: 'smooth'});//스크롤 맨 위로 부드럽게 이동
            }else{
                navigate(item.path);
            }
        }

    };

    //모달 닫기 클릭 함수
    const closeModal = () => setActiveModal(null);

    return(
        <div className="flex flex-col items-center gap-5">
            {NAV_ITEMS.map((item) => {
                //현재 활성화 되고있는 네비게이션 바
                const isActive = item.type === 'modal'
                    ? item.id === 'write'
                        ? activeModal === 'write' || globalPostModal === 'write'//나브 클릭 또는 수정 버튼 등 다른 경로로 열렸을 때 모두 반영
                        : activeModal === item.id
                    : item.path === ROUTES.FEED//금방 클릭한 path경로가 '/'와 같은가? (바로아래로)
                        ? location.pathname === ROUTES.FEED//현재 위치 path경로가 '/'와 같은가?
                        : item.path !== null && location.pathname.includes(item.path);//변수에 현재 route(feed 또는 profile) 저장

                const Icon = NAV_ICONS[item.id];

                return(
                    <button
                        key={item.id}
                        type="button"
                        title={item.label}
                        aria-label={item.label}
                        onClick={() => handlePathClick(item)}
                        className={`flex items-center justify-center w-[52px] h-[52px] rounded-[18px] transition-colors cursor-pointer ${
                            isActive
                                ? 'bg-white text-[#5cc8f1] shadow-[0_6px_18px_rgba(30,30,40,0.08)]'
                                : 'bg-white/50 text-[#9a9aa3] hover:bg-white/80'
                        }`}
                    >
                        <Icon/>
                    </button>
                );
            })}

            {/* 네비게이션의 모달(피드 작성) */}
            {activeModal === 'write' && (
                <PostFormModal closeModal={closeModal} mode='create'/>
            )}

            {/* 네비게이션의 모달(설정) */}
            {activeModal === 'settings' && (
                <SettingsModal closeModal={closeModal}/>
            )}
        </div>
    );
};

export default Navigation;
