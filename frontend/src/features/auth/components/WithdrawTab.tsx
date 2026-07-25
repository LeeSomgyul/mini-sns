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
        <div className="withdraw-container">
            <h3>정말 탈퇴하시겠습니까?</h3>
            <p className="description">
                탈퇴 시 모든 회원 정보 및 활동 기록이 삭제됩니다.<br />
                계속 진행하시려면 아래에 <strong>"{CONFIRM_TEXT}"</strong>를 입력해 주세요.
            </p>

            <div className="input-group">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputText(e.target.value)}
                    placeholder={`${CONFIRM_TEXT}를 입력하세요`}
                    disabled={isPending}
                />
            </div>

            <button
                type="button"
                onClick={handleWithdraw}
                disabled={!isInputValid || isPending}
                className={`withdraw-button ${isInputValid ? 'active' : 'disabled'}`}
            >
                {isPending ? '탈퇴 처리 중...' : '회원 탈퇴'}
            </button>
        </div>
    );
}