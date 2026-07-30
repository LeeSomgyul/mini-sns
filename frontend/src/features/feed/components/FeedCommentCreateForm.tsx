import { useState } from "react";
import { useCreateCommentMutation } from "../../post/hooks/useCreateCommentMutation";
import toast from "react-hot-toast";
import { FeedCommentSchema } from "../schemas/FeedCommentSchema";
import { useAuthStore } from "../../auth/store/authStore";
import { getProfileImageUrl } from "../../../common/utils/randomProfileImage";

export const FeedCommentForm = () => {

    const myUserId = useAuthStore((state) => state.myUserId);
    const myProfileImage = useAuthStore((state) => state.myProfileImageUrl);

    const profileImageUrl = getProfileImageUrl({
        profileImageUrl: myProfileImage,
        userId: myUserId,
    });

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
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
            className="m-0 p-4"
        >
            <div className="flex flex-col gap-1">
                <div className="flex gap-2 m-0">
                    {/* 1. 프로필 이미지 */}
                    <img
                        src={profileImageUrl}
                        className="w-11 h-11 rounded-full object-cover border border-black/10"
                    />
                    <div className="relative flex-1 flex flex-col justify-between min-h-[105px] rounded-2xl border border-black/10 bg-[#f4f4f6] p-3 transition-colors focus-within:border-[#5cc8f1] focus-within:bg-white">
                        {/* 2. 댓글 입력창 */}
                        <textarea
                            name="content"
                            placeholder="댓글을 입력하세요."
                            required
                            disabled={isPending}
                            maxLength={200}
                            rows={3}
                            onChange={handleInputChange}
                            className="w-full h-10 resize-none bg-transparent text-sm text-[#3a3a41] outline-none placeholder:text-gray-400 disabled:opacity-60 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-black/20"
                        />

                        {/* 3. 댓글 전송 버튼 */}
                        <div className="flex justify-end items-center pt-1">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="px-2 py-2 rounded-full bg-[#5cc8f1] text-white text-xs font-semibold cursor-pointer hover:bg-[#49b8e3] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-black/10"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                                    <path fill-rule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 0 1 9.75 22.5a.75.75 0 0 1-.75-.75v-4.131A15.838 15.838 0 0 1 6.382 15H2.25a.75.75 0 0 1-.75-.75 6.75 6.75 0 0 1 7.815-6.666ZM15 6.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" clip-rule="evenodd" />
                                    <path d="M5.26 17.242a.75.75 0 1 0-.897-1.203 5.243 5.243 0 0 0-2.05 5.022.75.75 0 0 0 .625.627 5.243 5.243 0 0 0 5.022-2.051.75.75 0 1 0-1.202-.897 3.744 3.744 0 0 1-3.008 1.51c0-1.23.592-2.323 1.51-3.008Z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <small className={`block text-right mt-1 text-xs ${textLength > 300 ? 'text-red-500' : 'text-[#a7a7ae]'}`}>
                {textLength} / 300자
            </small>
        </form>
    );
};