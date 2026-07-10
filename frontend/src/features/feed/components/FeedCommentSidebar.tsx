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
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', borderLeft: '1px solid var(--pico-table-border-color)' }}>
            
            {/* [상단 고정 영역] 타이틀 및 닫기 버튼 */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', margin: 0, borderBottom: '1px solid var(--pico-table-border-color)' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>댓글</h3>
                <button 
                    aria-label="Close" 
                    onClick={onClose}
                    style={{ margin: 0, padding: '0.2rem 0.5rem', width: 'auto', border: 'none', background: 'transparent', color: "black" }}
                >
                    ✕
                </button>
            </header>

            {/* 댓글 리스트 무한스크롤 영역 */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                {isLoading ? (
                    // 댓글을 불러오는 중이 경우
                    <div aria-busy="true" style={{ textAlign: 'center', padding: '3rem 0' }}>
                        댓글을 불러오는 중...
                    </div>
                ) : comments.length === 0 ? (
                    // 댓글이 없는 경우
                    <div style={{ textAlign: 'center', color: 'var(--pico-muted-color)', padding: '4rem 0' }}>
                        아직 댓글이 없습니다.<br />첫 댓글을 남겨보세요!
                    </div>
                ) : (
                    // 댓글 리스트 출력
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
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
                        <div ref={observerRef} style={{ height: '10px', width: '100%' }} />

                        {isFetchingNextPage && (
                            <div aria-busy="true" style={{ textAlign: 'center', padding: '1rem 0', fontSize: '0.9rem' }}>
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