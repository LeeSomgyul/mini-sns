import toast from "react-hot-toast";
import { useWithdrawMutation } from "../hooks/useWithdrawMutation";
import { useState } from "react";

export const WithdrawTap = () => {

    const CONFIRM_TEXT = '회원탈퇴';

    const [inputText, setInputText] = useState('');

    // [훅] 회원탈퇴
    const {mutate: withdraw, isPending} = useWithdrawMutation({
        onSuccess: (data) => {
            toast.success(data.message);
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || "회원탈퇴에 실패하였습니다.";
            toast.error(errorMessage);
        }
    });

    const isInputValid = inputText === CONFIRM_TEXT;

    const handleWithdraw = () => {
        if(!isInputValid || isPending) return;

        if (window.confirm('정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {

            // 회원탈퇴 실행
            withdraw();
        }
    }

    return(
        <div className="flex flex-col items-center gap-3 text-center w-full">
            <div className="flex flex-col items-center gap-2">
                <h3 className="text-lg font-semibold text-[#1c1c21]">정말 탈퇴하시겠습니까?</h3>
                <p className="text-sm text-[#8b8b93] leading-relaxed">
                    탈퇴 시 모든 회원 정보 및 활동 기록이 삭제됩니다.<br />
                    계속 진행하시려면 아래에 <strong className="text-[#54545c]">"{CONFIRM_TEXT}"</strong>를 입력해 주세요.
                </p>
            </div>

            <input
                type="text"
                value={inputText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputText(e.target.value)}
                placeholder={`${CONFIRM_TEXT}를 입력하세요`}
                disabled={isPending}
                className="h-10 w-full max-w-[260px] rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-800 outline-none focus:border-red-300 transition-colors placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-400"
            />

            <button
                type="button"
                onClick={handleWithdraw}
                disabled={!isInputValid || isPending}
                className="h-10 px-6 rounded-xl bg-red-500 text-white text-sm font-semibold cursor-pointer hover:bg-red-600 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
                {isPending ? '탈퇴 처리 중...' : '회원 탈퇴'}
            </button>
        </div>
    );
}
