import { useEffect, useRef, useState } from "react";
import { usePostComment } from "../../post/hooks/usePostComment";
import { useDeleteCommentMutation } from "../../post/hooks/useDeleteCommentMutation";
import { FeedCommentForm } from "./FeedCommentCreateForm";
import toast from "react-hot-toast";
import { FeedCommentList } from "./FeedCommentList";

interface FeedCommentSidebarProps {
    postId: number | null;
    onClose: () => void;
}

export const FeedCommentSidebar = ({postId, onClose}: FeedCommentSidebarProps) => {

    const DEFAULT_PROFILE = `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image.png`;
    
    // [상태] 수정중인 댓글 아이디
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);

    // [무한스크롤 훅 가져오기]
    const {
        comments,
        fetchNextPage,
        hasNextPage,
        isLoading,
        isFetchingNextPage,
    } = usePostComment(postId);

    // [댓글 삭제 훅 가져오기]
    const {mutate: deleteComment} = useDeleteCommentMutation({
        onSuccess: () => {
            toast.success("댓글이 삭제되었습니다.")
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || "댓글 삭제에 실패했습니다.";
            toast.error(errorMessage);
        },
    });

    // [댓글 자동으로 더 불러오기]
    // 1. 감시카메라 설치
    const observerRef = useRef<HTMLDivElement | null>(null);
    
    // 2. 화면에서 observerRef 보이면 다음 페이지 요청
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.5 }
        );

        if(observerRef.current) observer.observe(observerRef.current);

        return () => observer.disconnect();
    },[hasNextPage, isFetchingNextPage, fetchNextPage]);

    if(!postId) return null;

    // [삭제 버튼 클릭 핸들러]
    const handleDeleteComment = (commentId: number) => {
        if(window.confirm("정말 이 댓글을 완전히 삭제하시겠습니까?")){
            deleteComment(commentId);
        }
    };

    

    return(
        <div className="flex flex-col h-full">

            {/* [상단 고정 영역] 타이틀 및 닫기 버튼 */}
            <header className="flex justify-between items-center px-5 py-4 border-b border-black/5">
                <h3 className="m-0 text-lg font-semibold text-[#2b2b31]">댓글</h3>
                <button
                    aria-label="Close"
                    onClick={onClose}
                    className="m-0 border-0 bg-transparent text-[#2b2b31] cursor-pointer text-lg leading-none"
                >
                    ✕
                </button>
            </header>

            {/* 댓글 리스트 무한스크롤 영역 */}
            <div className="flex-1 overflow-y-auto p-5">
                {isLoading ? (
                    // 댓글을 불러오는 중이 경우
                    <div aria-busy="true" className="text-center py-12 text-sm text-[#8b8b92]">
                        댓글을 불러오는 중...
                    </div>
                ) : comments.length === 0 ? (
                    // 댓글이 없는 경우
                    <div className="text-center text-sm text-[#a7a7ae] py-16">
                        아직 댓글이 없습니다.<br />첫 댓글을 남겨보세요!
                    </div>
                ) : (
                    // 댓글 리스트 출력
                    <ul className="list-none p-0 m-0">
                        {comments.map((comment) => (
                            <FeedCommentList
                                key={comment.commentId}
                                comment={comment}
                                DEFAULT_PROFILE={DEFAULT_PROFILE}
                                isEditing={editingCommentId === comment.commentId}
                                onEditClick={() => setEditingCommentId(comment.commentId)}
                                onCancelEdit={() => setEditingCommentId(null)}
                                onDeleteClick={handleDeleteComment}
                            />
                        ))}

                        {/* 무한 스크롤 더보기 트리거 버튼 */}
                        <div ref={observerRef} className="h-2.5 w-full" />

                        {isFetchingNextPage && (
                            <div aria-busy="true" className="text-center py-4 text-sm text-[#8b8b92]">
                                다음 댓글을 불러오는 중...
                            </div>
                        )}
                    </ul>
                )}
            </div>

            {/* 하단 사용자 댓글 입력 창 */}
            <FeedCommentForm/>

        </div>
    );
};