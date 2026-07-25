import { useState, type MouseEventHandler } from "react";
import {useAuthStore} from "../features/auth/store/authStore";
import { useLogoutMutation } from "../features/auth/hooks/useLogoutMutation";
import { WithdrawTap } from "../features/auth/components/WithdrawTab";

interface SettingsModalProps{
    closeModal: () => void;
}

export const SettingsModal = ({closeModal} : SettingsModalProps) => {

    const accessToken = useAuthStore((state) => (state.accessToken));
    const {mutate: handleLogout, isPending} = useLogoutMutation({closeModal});

    const [selectedTab, setSelectedTab] = useState('logout');
    

    // [메서드] 모달 닫기
    const handleCloseModal: MouseEventHandler<HTMLButtonElement> = () => {
        closeModal();
    };

    // [메서드] 로그아웃 탭 클릭
    const handleClickLogoutTab: MouseEventHandler<HTMLLIElement> = () => {
        setSelectedTab('logout');
    };

    // [메서드] 회원탈퇴 탭 클릭
    const handleClickWithdrawTab: MouseEventHandler<HTMLLIElement> = () => {
        setSelectedTab('withdraw');
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
                {/*오른쪽: 로그아웃 & 회원탈퇴 탭 */}
                <section style={{ width: '70%', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    {selectedTab === 'logout' && (
                        <div>
                            <h3>로그아웃 하시겠습니까?</h3>
                            <div>
                                <button onClick={handleCloseModal}>취소</button>
                                <button
                                    onClick={() => {
                                        if(!accessToken) return;
                                        handleLogout();
                                    }}
                                    disabled={isPending}
                                >
                                    로그아웃
                                </button>
                            </div>
                        </div>
                    )}
                    {selectedTab === 'withdraw' && <WithdrawTap/>}
                </section>
            </article>
        </dialog>
    );
};
