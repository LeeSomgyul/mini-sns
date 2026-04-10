import { useLocation, useNavigate } from "react-router-dom"; 
import { useState } from "react";

import type { NavItemType, ModalType } from "../types/navItem";
import { ROUTES } from "../constants/routes";


const Navigation = () => {

    const location = useLocation();
    const navigate = useNavigate();

    const [activeModal, setActiveModal] = useState<ModalType>(null);//모달 오픈 유무
    const userId = "userId"; //🚨🚨실제 사용자 id 넣기🚨🚨

    const NAV_ITEMS: NavItemType[] = [
        {id: 'feed', path: ROUTES.FEED, label: '메인 피드', type: 'link'},
        {id: 'write', path: null, label: '피드 작성', type: 'modal'},
        {id: 'profile', path: ROUTES.PROFILE(userId), label: '프로필', type: 'link'},
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
        <div className="nav-wrapper">
            <ul className="nav-menu">
                {NAV_ITEMS.map((item) => {
                    //현재 활성화 되고있는 네비게이션 바
                    const isActive = item.path === ROUTES.FEED//금방 클릭한 path경로가 '/'와 같은가? (바로아래로)
                        ? location.pathname === ROUTES.FEED//현재 위치 path경로가 '/'와 같은가?
                        : item.path && location.pathname.includes(item.path);//변수에 현재 route(feed 또는 profile) 저장

                    return(
                        <li 
                            key={item.label}
                            className={`${isActive ? 'active' : ''} ${item.id === 'settings' ? 'settings-item' : ''}`}
                            onClick={() => handlePathClick(item)}
                        >
                            {item.label}
                        </li>
                    );
                })}
            </ul>
            {/* 네비게이션의 모달(피드 작성, 설정) 
                🚨🚨프로필, 설정 개발 시 실제 모달로 수정(임의로 pico 사용)🚨🚨*/}
            {activeModal === 'write' && (
                <dialog open>
                    <article>
                        <header>
                            {/* 우측 상단 삭제 버튼 */}
                            <button aria-label="Close" className="close" onClick={closeModal}></button>
                            <h2>피드 작성</h2>
                        </header>
                        <p>여기에 피드 작성 폼이 들어갈 예정</p>
                        <footer>
                            <button className="secondary" onClick={closeModal}>취소</button>
                            <button onClick={closeModal}>작성하기</button>
                        </footer>
                    </article>
                </dialog>
            )} 

            {activeModal === 'settings' && (
                <dialog open>
                    <article>
                        <header>
                            {/* 우측 상단 삭제 버튼 */}
                            <button aria-label="Close" className="close" onClick={closeModal}></button>
                            <h2>설정</h2>
                        </header>
                        <p>로그아웃, 회원탈퇴가 들어갈 예정</p>
                        <footer>
                            <button onClick={closeModal}>확인</button>
                        </footer>
                    </article>
                </dialog>
            )} 
        </div>
    );
};

export default Navigation;