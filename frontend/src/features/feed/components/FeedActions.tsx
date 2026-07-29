import { useState } from "react";
import { LikeButton } from "./LikeButton";
import { FeedTagModal } from "./FeedTagModal";
import { useCommentStore } from "../../../common/store/useCommentStore";

interface FeedActionsProps{
    postId: number;
    isLiked?: boolean;
    likeCount?: number;
    commentCount?: number;
}

//[컴포넌트] 피드 카드의 좋아요/댓글/태그 공간
//@param FeedActionsProps: 백엔드에서 가져온 게시물의 좋아요 및 댓글 개수
export const FeedActions = ({
    postId,
    isLiked = false,
    likeCount=0,
    commentCount=0,
}: FeedActionsProps) => {

    const [ isTagModalOpen, setIsTagModalOpen] = useState(false);

    // 댓글 전역 상태 연결
    const activePostId = useCommentStore((state) => state.activePostId);
    const toggleCommentSide = useCommentStore((state) => state.toggleCommentSide);

    // 현재 이 게시물의 댓글 창이 우측에 켜져 있는지 확인
    const isCurrentCommentOpen = activePostId === postId;
    
    return(
        <footer className="flex items-center gap-2 pt-1">
            {/* 좋아요 버튼 */}
            <LikeButton
                postId={postId}
                likeCount={likeCount}
                isLiked={isLiked}
            />

            {/* 댓글 버튼 */}
            <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${
                    isCurrentCommentOpen ? 'bg-[#f4f4f6] text-[#2b2b31]' : 'text-[#8b8b92] hover:bg-[#f4f4f6]'
                }`}
                onClick={() => toggleCommentSide(postId)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 text-[black/5]">
                    <path fill-rule="evenodd" d="M12 2.25c-2.429 0-4.817.178-7.152.521C2.87 3.061 1.5 4.795 1.5 6.741v6.018c0 1.946 1.37 3.68 3.348 3.97.877.129 1.761.234 2.652.316V21a.75.75 0 0 0 1.28.53l4.184-4.183a.39.39 0 0 1 .266-.112c2.006-.05 3.982-.22 5.922-.506 1.978-.29 3.348-2.023 3.348-3.97V6.741c0-1.947-1.37-3.68-3.348-3.97A49.145 49.145 0 0 0 12 2.25ZM8.25 8.625a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Zm2.625 1.125a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" clip-rule="evenodd" />
                </svg>
                {commentCount}
            </button>

            {/* 태그 버튼 */}
            <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-[#8b8b92] hover:bg-[#f4f4f6] cursor-pointer transition-colors"
                onClick={() => setIsTagModalOpen(true)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 text-[black/5]">
                    <path fill-rule="evenodd" d="M5.25 2.25a3 3 0 0 0-3 3v4.318a3 3 0 0 0 .879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 0 0 5.441-5.44c.758-1.16.492-2.629-.428-3.548l-9.58-9.581a3 3 0 0 0-2.122-.879H5.25ZM6.375 7.5a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z" clip-rule="evenodd" />
                </svg>
            </button>

            {/* 태그 모달 */}
            <FeedTagModal
                postId={postId}
                isOpen={isTagModalOpen}
                onClose={() => setIsTagModalOpen(false)}
            />
        </footer>
    );
};