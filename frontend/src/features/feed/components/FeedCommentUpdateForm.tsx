import { useState } from "react";
import toast from "react-hot-toast";
import { useUpdateCommentMutation } from "../../post/hooks/useUpdateCommentMutation";
import type { AxiosError } from "axios";
import type { ErrorResponse } from "../../../common/types/commonType";
import { FeedCommentSchema } from "../schemas/FeedCommentSchema";

interface FeedCommentUpdateProps {
    onClose: () => void;
    commentId: number;
    initialContent: string;
}

export const FeedCommentUpdateForm = ({ onClose, commentId, initialContent }: FeedCommentUpdateProps) => {

    // [상태 관리] 댓글 글자 수 모니터링
    const [textLength, setTextLength] = useState(initialContent.length);

    // [훅 연결] 댓글 수정
    const { mutate: handleUpdateComment, isPending } = useUpdateCommentMutation({
        onSuccess: () => {
            // 백엔드 수정 완료 후 수정창 닫기
            onClose();
        },
        onError: (error: AxiosError<ErrorResponse>) => {
            const errorMessage = error.response?.data?.message || "댓글 수정에 실패했습니다.";
            console.log(errorMessage);
        }
    });

    // [메서드] 한국어 301자 입력 방지
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const currentValue = e.target.value;
        if(currentValue.length > 300){
            e.target.value = currentValue.slice(0,300);
            setTextLength(300);
        }else{
            setTextLength(currentValue.length);
        }
    };

    // [메서드] 댓글 수정 완료 버튼
    const handleCommentSubmit = async(formData: FormData) => {
        const commentContent = formData.get("content");

        if(!commentContent) return;

        // Zod 폼 유효성 검사
        const zodReuslt = FeedCommentSchema.safeParse({content: commentContent});

        if(!zodReuslt.success){
            const formErrorMessage = zodReuslt.error.message;
            toast.error(formErrorMessage || "입력값이 올바르지 않습니다.");
            return;
        }

        // 백엔드 request로 전달
        handleUpdateComment({
            commentId: commentId,
            content: zodReuslt.data.content
        });
    };

    return(
        <form
            action={handleCommentSubmit}
            style={{ margin: 0, padding: '0.5rem 0', width: '100%', background: 'var(--pico-background-color)' }}
        >
            <div style={{ width: '100%', marginBottom: '0.5rem' }}>
                <input 
                    type="text" 
                    name="content"
                    defaultValue={initialContent}
                    placeholder="수정할 내용을 입력하세요." 
                    required 
                    disabled={isPending}
                    maxLength={300}
                    onChange={handleInputChange}
                    style={{ margin: 0, flex: 1 }}
                />
                {/* 수정 시 입력창 +  취소/저장 버튼 */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', width: '100%' }}>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        style={{ 
                            margin: 0, 
                            width: 'auto', 
                            padding: '0.4rem 1.2rem', 
                            fontSize: '0.85rem',
                            background: 'var(--pico-secondary-background-color)', 
                            border: 'none',
                            color: 'var(--pico-secondary-color)'
                        }}
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        style={{ 
                            margin: 0, 
                            width: 'auto', 
                            padding: '0.4rem 1.2rem',
                            fontSize: '0.85rem'
                        }}
                    >
                        {isPending ? "저장 중..." : "저장"}
                    </button>
                </div>
            </div>
            <small style={{ alignSelf: 'flex-end', color: textLength > 300 ? 'red' : 'orange', fontSize: '0.8rem' }}>
                {textLength} / 300자
            </small>
        </form>
    );
};