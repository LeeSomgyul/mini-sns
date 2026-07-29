import { useState } from "react";
import { createPortal } from "react-dom";
import {useAuthStore} from "../features/auth/store/authStore";
import { useLogoutMutation } from "../features/auth/hooks/useLogoutMutation";
import { WithdrawTap } from "../features/auth/components/WithdrawTab";

interface SettingsModalProps{
    closeModal: () => void;
}

export const SettingsModal = ({closeModal} : SettingsModalProps) => {

    const accessToken = useAuthStore((state) => (state.accessToken));
    const {mutate: handleLogout, isPending} = useLogoutMutation({closeModal});

    const [selectedTab, setSelectedTab] = useState<'logout' | 'withdraw'>('logout');


    // [메서드] 모달 닫기
    const handleCloseModal = () => {
        closeModal();
    };

    // [메서드] 로그아웃 탭 클릭
    const handleClickLogoutTab = () => {
        setSelectedTab('logout');
    };

    // [메서드] 회원탈퇴 탭 클릭
    const handleClickWithdrawTab = () => {
        setSelectedTab('withdraw');
    };

    const tabBaseClass = "w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer";

    return createPortal(
        <dialog
            open
            onClick={handleCloseModal}
            className="fixed inset-0 z-[9999] m-0 flex h-full w-full max-h-none max-w-none items-center justify-center bg-black/40 backdrop-blur-sm p-0"
        >
            <article
                onClick={(e) => e.stopPropagation()}
                className="animate-modal-rise flex flex-col w-[90vw] h-[300px] max-w-[560px] max-h-[85vh] rounded-3xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden"
            >
                <header className="flex items-center justify-between px-6 py-5 border-b border-black/10 shrink-0">
                    <span className="text-lg font-semibold text-[#2b2b31]">설정</span>
                    <button
                        aria-label="Close"
                        onClick={handleCloseModal}
                        className="flex items-center justify-center w-8 h-8 rounded-[10px] hover:bg-black/10 cursor-pointer transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 text-[#2b2b31]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <div className="flex flex-1 min-h-0">
                    {/*왼쪽: 메뉴 탭 영역 */}
                    <aside className="w-[150px] shrink-0 border-r border-black/10 p-4 flex flex-col gap-1">
                        <button
                            type="button"
                            onClick={handleClickLogoutTab}
                            className={`${tabBaseClass} ${
                                selectedTab === 'logout'
                                    ? 'bg-[#5cc8f1]/10 text-[#5cc8f1]'
                                    : 'text-[#6b6b74] hover:bg-black/5'
                            }`}
                        >
                            로그아웃
                        </button>
                        <button
                            type="button"
                            onClick={handleClickWithdrawTab}
                            className={`${tabBaseClass} ${
                                selectedTab === 'withdraw'
                                    ? 'bg-red-50 text-red-500'
                                    : 'text-[#6b6b74] hover:bg-red-50 hover:text-red-500'
                            }`}
                        >
                            회원탈퇴
                        </button>
                    </aside>

                    {/*오른쪽: 로그아웃 & 회원탈퇴 컨텐츠 */}
                    <section className="flex-1 min-w-0 p-8 flex flex-col items-center justify-center">
                        {selectedTab === 'logout' && (
                            <div className="flex flex-col items-center gap-6 text-center">
                                <div className="flex flex-col items-center gap-2">
                                    <h3 className="text-lg font-semibold text-[#1c1c21]">계정 로그아웃</h3>
                                    <p className="text-sm text-[#8b8b93]">현재 계정에서 로그아웃하시겠습니까?</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleCloseModal}
                                        className="h-10 px-6 rounded-xl w-[120px] bg-white border border-gray-200 text-sm font-medium text-[#54545c] hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={() => {
                                            if(!accessToken) return;
                                            handleLogout();
                                        }}
                                        disabled={isPending}
                                        className="h-10 px-6 rounded-xl border w-[120px] border-red-100 text-sm font-semibold text-white bg-[#49B8E3] hover:bg-[#49B8E3]/85 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        로그아웃
                                    </button>
                                </div>
                            </div>
                        )}
                        {selectedTab === 'withdraw' && <WithdrawTap/>}
                    </section>
                </div>
            </article>
        </dialog>,
        document.body
    );
};
