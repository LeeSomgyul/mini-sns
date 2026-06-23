import { useState } from 'react';

interface useUpdatePostProps {
    closeModal: () => void;
}

export const useUpdatePostMutation = ({closeModal}: useUpdatePostProps) => {
    const [isPending, setIsPending] = useState(false);

    const mutate = (data: any) => {
        setIsPending(true);
        console.log("✏️ [임시 수정 Mutation 실행] 전송될 데이터:", data);
        
        // 1초 뒤에 모달을 닫아주어 성공한 것처럼 시뮬레이션합니다.
        setTimeout(() => {
            setIsPending(false);
            closeModal();
            alert("게시물이 임시로 수정되었습니다! (실제 DB 반영은 다음 단계에서 구현)");
        }, 1000);
    };

    return {
        mutate,
        isPending
    };
};