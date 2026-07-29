import { useNavigate } from "react-router-dom";
import type { FeedComment } from "../../post/types/PostCommentType"
import { FeedCommentUpdateForm } from "./FeedCommentUpdateForm";
import { ROUTES } from "../../../constants/routes";

interface FeedCommentListProps{
    comment: FeedComment;
    DEFAULT_PROFILE: string;
    isEditing: boolean;
    onEditClick: () => void;
    onCancelEdit: () => void;
    onDeleteClick: (commentId: number) => void;
    onClose: () => void;
}

export const FeedCommentList = ({comment, DEFAULT_PROFILE, isEditing, onEditClick, onCancelEdit, onDeleteClick, onClose}: FeedCommentListProps) => {
    
    const MINIO_MEDIA_ENDPOINT = `${import.meta.env.VITE_MINIO_MEDIA_ENDPOINT}/`;
    const finalImage = comment.author.profileImageUrl !== null
        ? MINIO_MEDIA_ENDPOINT+comment.author.profileImageUrl
        : DEFAULT_PROFILE;

    const navigate = useNavigate();

    const handleUserClick = (userId: number) => {
        onClose();
        navigate(ROUTES.PROFILE.LINK(userId));
    };
    
    return(
        <li
            key={comment.commentId}
            className="flex gap-3 items-start mb-6"
        >
            {/* 작성자 프로필 이미지 */}
            <img
                src={finalImage || DEFAULT_PROFILE}
                alt={`${comment.author.nickname} 프로필`}
                onClick={() => handleUserClick(comment.author.userId)}
                className="w-11 h-11 rounded-full object-cover flex-shrink-0 border border-black/10 cursor-pointer"
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
                        <div className="flex justify-flex items-baseline gap-2">
                            <strong className="text-sm font-semibold text-[#2b2b31]">
                                {comment.author.nickname}
                            </strong>
                            <small className="text-xs text-[#a7a7ae]">
                                {new Date(comment.createdAt).toLocaleDateString()}
                            </small>
                        </div>
                        <p className="mt-1 mb-0 text-[0.85rem] text-[#54545c] break-words">
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
                                className="m-0 px-0.5 py-0.5 rounded-md text-xs text-[#8b8b92] cursor-pointer transition-colors"
                                onClick={onEditClick}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 text-[black/5]">
                                    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
                                </svg>
                            </button>
                            <button
                                className="m-0 px-0.5 py-0.5 rounded-md text-xs text-[#d93526] cursor-pointer transition-colors"
                                onClick={() => onDeleteClick(comment.commentId)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4 text-[#FF4D4F]">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                            </button>
                        </div>
                    )}
                </>
            )}
        </li>
    );
};