import type { FeedComment } from "../../post/types/PostCommentType"
import { FeedCommentUpdateForm } from "./FeedCommentUpdateForm";

interface FeedCommentListProps{
    comment: FeedComment;
    DEFAULT_PROFILE: string;
    isEditing: boolean;
    onEditClick: () => void;
    onCancelEdit: () => void;
    onDeleteClick: (commentId: number) => void;
}

export const FeedCommentList = ({comment, DEFAULT_PROFILE, isEditing, onEditClick, onCancelEdit, onDeleteClick}: FeedCommentListProps) => {
    return(
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
            
            {/* [조건부 렌더링] 댓글 수정 모드 & 일반 조회 모드 */}
            {isEditing ? (
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.3rem' }}>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--pico-h1-color)' }}>
                        {comment.author.nickname}
                    </strong>
                </div>
                <FeedCommentUpdateForm
                    commentId={comment.commentId}
                    initialContent={comment.content}
                    onClose={onCancelEdit}
                />
                </div>
            ) : (
                <>
                    {/* 일반 댓글 보기 */}
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
                            {comment.isEdited && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--pico-muted-color)', marginLeft: '0.4rem' }}>
                                    (수정됨)
                                </span>
                            )}
                        </p>
                    </div>

                    {/* [조건부 렌더링] 내가 쓴 댓글일 경우에만 수정/삭제 버튼 노출 */}
                    {comment.isMine && (
                        <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                            <button
                                style={{ margin: 0, padding: '0.1rem 0.3rem', fontSize: '0.75rem', width: 'auto' }}
                                className="outline secondary"
                                onClick={onEditClick}
                            >
                                수정
                            </button>
                            <button
                                style={{ margin: 0, padding: '0.1rem 0.3rem', fontSize: '0.75rem', width: 'auto' }}
                                className="outline contrast"
                                onClick={() => onDeleteClick(comment.commentId)}
                            >
                                삭제
                            </button>
                        </div>
                    )}
                </>
            )}
        </li>
    );
};