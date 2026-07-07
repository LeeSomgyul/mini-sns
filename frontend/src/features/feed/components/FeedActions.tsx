import { useState } from "react";
import { LikeButton } from "./LikeButton";
import { FeedTagModal } from "./FeedTagModal";
import { useCommentStore } from "../store/useCommentStore";

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
        <footer style={{ display: 'flex', gap: '1rem', padding: '0.5rem 0', borderTop: '1px solid var(--pico-table-border-color)' }}>
            {/* 좋아요 버튼 */}
            <LikeButton
                postId={postId}
                likeCount={likeCount}
                isLiked={isLiked}
            />

            {/* 댓글 버튼 */}
            <button 
                className={isCurrentCommentOpen ? "" : "outline secondary"} 
                style={{ padding: '0.4rem 0.8rem' }}
                onClick={() => toggleCommentSide(postId)}
            >
                💬 댓글 {commentCount}
            </button>

            {/* 태그 버튼 */}
            <button
                className="outline secondary"
                style={{ padding: '0.4rem 0.8rem' }}
                onClick={() => setIsTagModalOpen(true)}
            >
                🏷️ 태그
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