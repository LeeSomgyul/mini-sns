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
            className="m-0 py-2 w-full"
        >
            <div className="w-full mb-2">
                <input
                    type="text"
                    name="content"
                    defaultValue={initialContent}
                    placeholder="수정할 내용을 입력하세요."
                    required
                    disabled={isPending}
                    maxLength={300}
                    onChange={handleInputChange}
                    className="m-0 mb-2 w-full rounded-full border border-black/10 bg-[#f4f4f6] px-4 py-2 text-sm outline-none focus:border-[#5cc8f1] disabled:opacity-60"
                />
                {/* 수정 시 입력창 +  취소/저장 버튼 */}
                <div className="flex justify-end gap-2 w-full">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        className="m-0 w-auto rounded-full bg-[#f4f4f6] text-[#7a7a82] px-4 py-1.5 text-[0.85rem] border-0 cursor-pointer hover:bg-[#eaeaed] transition-colors disabled:opacity-60"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="m-0 w-auto rounded-full bg-[#5cc8f1] text-white px-4 py-1.5 text-[0.85rem] font-semibold cursor-pointer hover:bg-[#49b8e3] transition-colors disabled:opacity-60"
                    >
                        {isPending ? "저장 중..." : "저장"}
                    </button>
                </div>
            </div>
            <small className={`block text-right text-xs ${textLength > 300 ? 'text-red-500' : 'text-[#a7a7ae]'}`}>
                {textLength} / 300자
            </small>
        </form>
    );
};