import { create } from "zustand";

interface CommentStoreState{
    // 1. 현재 우측 창에 켜진 게시물의 ID (null이면 댓글 창 닫힘 = 검색창 노출)
    activePostId: number | null;
    
    // 2. 댓글 버튼 토글 및 변경 함수
    toggleCommentSide: (postId: number) => void;
    
    // 3. 댓글 창 강제 닫기 (X 버튼용)
    closeCommentSide: () => void;
}

// 댓글 관련 전역 데이터
export const useCommentStore = create<CommentStoreState>((set) => ({
    activePostId: null,

    toggleCommentSide: (postId) => set((state) => ({
        activePostId: state.activePostId === postId ? null : postId
    })),

    closeCommentSide: () => set({activePostId: null}),
}));