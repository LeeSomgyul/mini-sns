import { useEffect, useRef } from "react";
import { usePostComment } from "../../post/hooks/usePostComment";
import { FeedCommentForm } from "./FeedCommentForm";

interface FeedCommentSidebarProps {
    postId: number | null;
    onClose: () => void;
}

export const FeedCommentSidebar = ({postId, onClose}: FeedCommentSidebarProps) => {

    const DEFAULT_PROFILE = `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image.png`;

    // [무한스크롤 훅 가져오기]
    const {
        comments,
        fetchNextPage,
        hasNextPage,
        isLoading,
        isFetchingNextPage,
    } = usePostComment(postId);

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
                            <li 
                                key={comment.commentId} 
                                style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem', alignItems: 'flex-start' }}
                            >
                                {/* 작성자 프로필 이미지 */}
                                <img 
                                    src={comment.author.profileImageUrl || DEFAULT_PROFILE} 
                                    alt={`${comment.author.nickname} 프로필`}
                                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                                />
                                
                                {/* 닉네임+날짜 / 내용 */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                        <strong style={{ fontSize: '0.9rem', color: 'var(--pico-h1-color)' }}>
                                            {comment.author.nickname}
                                        </strong>
                                        <small style={{ fontSize: '0.75rem', color: 'var(--pico-muted-color)' }}>
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </small>
                                    </div>
                                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.95rem', wordBreak: 'break-word' }}>
                                        {comment.content}
                                    </p>
                                </div>

                                {/* 내가 쓴 댓글일 경우에만 수정/삭제 버튼 노출 */}
                                {comment.isMine && (
                                    <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                                        <button style={{ margin: 0, padding: '0.1rem 0.3rem', fontSize: '0.75rem', width: 'auto' }} className="outline secondary">수정</button>
                                        <button style={{ margin: 0, padding: '0.1rem 0.3rem', fontSize: '0.75rem', width: 'auto' }} className="outline contrast">삭제</button>
                                    </div>
                                )}
                            </li>
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