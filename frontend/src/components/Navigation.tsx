import { useLocation, useNavigate } from "react-router-dom"; 
import { ROUTES } from "../constants/routes";
import { useState } from "react";

const Navigation = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);//모달 오픈 유무
    const userId = "userId"; //🚨🚨실제 사용자 id 넣기🚨🚨

    const NAV_ITEMS:  = [
        {path: ROUTES.FEED, label: '메인 피드', type: 'link'},
        {path: null, label: '피드 작성', type: 'modal'},
        {path: ROUTES.PROFILE(userId), label: '프로필', type: 'link'}
    ];

    const handlePathClick = (item) => {
        //모달을 열어야 하는 경우
        if(item.type === 'modal'){
            setIsWriteModalOpen(true);
            return;
        }

        //주소를 열어야 하는 경우

    };

    return(
        <div className="nav-wrapper">
            <ul className="nav-menu">
                {NAV_ITEMS.map((item) => {
                    //현재 활성화 되고있는 네비게이션 바
                    const isActive = item.path === ROUTES.FEED//route 명칭이 '/'와 같은지
                        ? location.pathname === ROUTES.FEED//현재 route가 '/'와 같은지
                        : item.path && location.pathname.includes(item.path);//변수에 현재 route(feed 또는 profile) 저장

                    return(
                        <li 
                            key={item.label}
                            className={isActive ? 'active' : ''}
                            onClick={() => handlePathClick(item)}
                        >
                            {item.label}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default Navigation;