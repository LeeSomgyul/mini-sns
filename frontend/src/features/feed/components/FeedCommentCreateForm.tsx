import { useState } from "react";
import { useCreateCommentMutation } from "../../post/hooks/useCreateCommentMutation";
import toast from "react-hot-toast";
import { FeedCommentSchema } from "../schemas/FeedCommentSchema";

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
        const zodReuslt = FeedCommentSchema.safeParse({content: commentContent});

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
            className="m-0 p-4 border-t border-black/5"
        >
            <div className="flex flex-col gap-1">
                <div className="flex gap-2 m-0">
                    <input
                        type="text"
                        name="content"
                        placeholder="댓글을 입력하세요."
                        required
                        disabled={isPending}
                        maxLength={300}
                        onChange={handleInputChange}
                        className="flex-1 m-0 rounded-full border border-black/10 bg-[#f4f4f6] px-4 py-2 text-sm outline-none focus:border-[#5cc8f1] disabled:opacity-60"
                    />
                    <button
                        type="submit"
                        disabled={isPending}
                        className="m-0 w-auto px-5 rounded-full bg-[#5cc8f1] text-white text-sm font-semibold cursor-pointer hover:bg-[#49b8e3] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isPending ? "등록 중..." : "등록"}
                    </button>
                </div>
            </div>
            <small className={`block text-right mt-1 text-xs ${textLength > 300 ? 'text-red-500' : 'text-[#a7a7ae]'}`}>
                {textLength} / 300자
            </small>
        </form>
    );
};