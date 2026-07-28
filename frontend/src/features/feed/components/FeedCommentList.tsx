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
    
    const MINIO_MEDIA_ENDPOINT = `${import.meta.env.VITE_MINIO_MEDIA_ENDPOINT}/`;
    const finalImage = comment.author.profileImageUrl !== null
        ? MINIO_MEDIA_ENDPOINT+comment.author.profileImageUrl
        : DEFAULT_PROFILE;
    
    return(
        <li
            key={comment.commentId}
            className="flex gap-3 items-start mb-6"
        >
            {/* 작성자 프로필 이미지 */}
            <img
                src={finalImage || DEFAULT_PROFILE}
                alt={`${comment.author.nickname} 프로필`}
                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
            />

            {/* [조건부 렌더링] 댓글 수정 모드 & 일반 조회 모드 */}
            {isEditing ? (
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                    <strong className="text-sm font-semibold text-[#2b2b31]">
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
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                            <strong className="text-sm font-semibold text-[#2b2b31]">
                                {comment.author.nickname}
                            </strong>
                            <small className="text-xs text-[#a7a7ae]">
                                {new Date(comment.createdAt).toLocaleDateString()}
                            </small>
                        </div>
                        <p className="mt-1 mb-0 text-[0.95rem] text-[#54545c] break-words">
                            {comment.content}
                            {comment.isEdited && (
                                <span className="text-xs text-[#a7a7ae] ml-1.5">
                                    (수정됨)
                                </span>
                            )}
                        </p>
                    </div>

                    {/* [조건부 렌더링] 내가 쓴 댓글일 경우에만 수정/삭제 버튼 노출 */}
                    {comment.isMine && (
                        <div className="flex gap-1 flex-shrink-0">
                            <button
                                className="m-0 px-2 py-0.5 rounded-md text-xs text-[#8b8b92] hover:bg-[#f4f4f6] cursor-pointer transition-colors"
                                onClick={onEditClick}
                            >
                                수정
                            </button>
                            <button
                                className="m-0 px-2 py-0.5 rounded-md text-xs text-[#d93526] hover:bg-[#fdeceb] cursor-pointer transition-colors"
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