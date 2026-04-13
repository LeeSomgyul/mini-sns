import { useState, useContext, type MouseEventHandler } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { AuthContext } from "../context/AuthContext"
import type { SettingsModalProps, SettingsTabType } from '../types/modalType';
import { ROUTES } from "../constants/routes";

const SettingsModal = ({closeModal} : SettingsModalProps) => {

    const authContext = useContext(AuthContext);
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState<SettingsTabType>('logout');

    const handleCloseModal: MouseEventHandler<HTMLButtonElement> = (e) => {
        closeModal();
    };

    const handleClickLogoutTab: MouseEventHandler<HTMLLIElement> = (e) => {
        setSelectedTab('logout');
    };

    const handleClickWithdrawTab: MouseEventHandler<HTMLLIElement> = (e) => {
        setSelectedTab('withdraw');
    };

    const handleRunLogout: MouseEventHandler<HTMLButtonElement> = async(e) => {
        if(!authContext) return;

        try{
            const config = {
                headers: {
                    Authorization: `Bearer ${authContext.accessToken}`
                }
            };

            //axios.post(주소, 데이터, 설정) 순서로 보내야 한다. 헤더 데이터를 전송하기 때문에 데이터(body)는 {}
            await api.post('/api/v1/auth/logout', {}, config);

            authContext.logout();
            closeModal();
            navigate(ROUTES.LOGIN, {replace: true});
        }catch(error){
            console.log("로그아웃 실패: ", error);
            authContext.logout();
            closeModal();
            navigate(ROUTES.LOGIN, {replace: true});
        }
    };

    return(
        <dialog open>
            <article style={{ display: 'flex', minHeight: '300px', padding: 0 }}>
                {/*왼쪽: 메뉴바 영역 */}
                <aside style={{ width: '30%', borderRight: '1px solid #eee', padding: '20px' }}>
                    <header>
                        <button
                            aria-label="Close" 
                            className="close" 
                            onClick={handleCloseModal}
                        />
                    </header>
                    <ul>
                        <li onClick={handleClickLogoutTab}>로그아웃</li>
                        <li onClick={handleClickWithdrawTab}>회원탈퇴</li>
                    </ul>
                </aside>
                {/*오른쪽: 선택 영역 */}
                <section style={{ width: '70%', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    {selectedTab === 'logout' && (
                        <div>
                            <h3>로그아웃 하시겠습니까?</h3>
                            <div>
                                <button onClick={handleCloseModal}>취소</button>
                                <button onClick={handleRunLogout}>로그아웃</button>
                            </div>
                        </div>
                    )}
                    {selectedTab === 'withdraw' && (
                        <div>
                            <h3>정말 탈퇴하시겠습니까?</h3>
                            {/*작성하기*/}
                        </div>
                    )}
                </section>
            </article>
        </dialog>
    );
};

export default SettingsModal;