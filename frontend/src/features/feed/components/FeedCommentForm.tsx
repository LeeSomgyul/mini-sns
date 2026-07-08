import { useState } from "react";
import { useCreateCommentMutation } from "../../post/hooks/useCreateCommentMutation";
import { z } from "zod";
import toast from "react-hot-toast";

// [Zod 스키마 정의] 폼 검사 관리
const commentSchema = z.object({
    content: z.string()
        .trim()
        .min(1, "댓글 내용은 필수입니다.")
        .max(300, "댓글은 최대 300자까지만 입력할 수 있습니다.")
});

export const FeedCommentForm = () => {

    // [상태 관리] 댓글 글자 수 모니터링
    const [textLength, setTextLength] = useState(0);

    const {mutate: handleCreateComment, isPending} = useCreateCommentMutation({
        // useCreateCommentMutation의 onSuccess 실행 이후 구동
        onSuccess: () => {
            setTextLength(0);
        },
        // useCreateCommentMutation의 onError 실행 이후 구동
        onError: (error) => {
            const errorMessage = error.response?.data?.message || "댓글 등록에 실패했습니다.";
            toast.error(errorMessage);
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

    // [메서드] 댓글 등록 버튼
    const handleCommentSubmit = async(formData: FormData) => {
        const commentContent = formData.get("content");

        if(!commentContent) return;

        // Zod 폼 유효성 검사
        const zodReuslt = commentSchema.safeParse({content: commentContent});

        if(!zodReuslt.success){
            const formErrorMessage = zodReuslt.error.message;
            toast.error(formErrorMessage || "입력값이 올바르지 않습니다.");
            return;
        }

        // 백엔드 request로 전달
        handleCreateComment({content: zodReuslt.data.content});
    };
    
    return(
        <form
            action={handleCommentSubmit}
            style={{ margin: 0, padding: '1rem', borderTop: '1px solid var(--pico-table-border-color)', background: 'var(--pico-background-color)' }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', margin: 0 }}>
                    <input 
                        type="text" 
                        name="content"
                        placeholder="댓글을 입력하세요." 
                        required 
                        disabled={isPending}
                        maxLength={300}
                        onChange={handleInputChange}
                        style={{ margin: 0, flex: 1 }}
                    />
                    <button
                        type="submit"
                        disabled={isPending}
                        style={{ margin: 0, width: 'auto', padding: '0 1.2rem' }}
                    >
                        {isPending ? "등록 중..." : "등록"}
                    </button>
                </div>
            </div>
            <small style={{ alignSelf: 'flex-end', color: textLength > 300 ? 'red' : 'orange', fontSize: '0.8rem' }}>
                {textLength} / 300자
            </small>
        </form>
    );
};