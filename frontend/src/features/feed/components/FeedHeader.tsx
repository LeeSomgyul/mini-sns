import type {AuthorDto} from "../types/feedResponseType";
import { formatFeedDate } from "../hooks/formatFeedDate";
import { useDeletePost } from "../../post/hooks/useDeletePost";
import { usePostModalStore } from "../../../common/store/usePostModalStore";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants/routes";

interface FeedHeaderProps {
    postId: number;
    author: AuthorDto;
    createdAt: string;
    isAuthor: boolean;
    onDeleteSuccess?: () => void;
}

//[컴포넌트] 피드 카드 상단의 '작성자 정보' 및 '수정 and 삭제' 버튼 영역 
//@param {FeedHeaderProps} props - 작성자 정보, 작성 시간, 본인 여부
export const FeedHeader = ({ postId, author, createdAt, isAuthor, onDeleteSuccess}: FeedHeaderProps) => {

    const MINIO_MEDIA_ENDPOINT = `${import.meta.env.VITE_MINIO_MEDIA_ENDPOINT}/`;
    const DEFAULT_PROFILE = `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image.png`;

    const navigate = useNavigate();
    const {mutate: deletePost, isPending} = useDeletePost({
        onDeleteSuccess: () => {
            if(onDeleteSuccess){
                onDeleteSuccess();
            }
        }
    });
    const {openEditModal} = usePostModalStore();
    const finalImage = MINIO_MEDIA_ENDPOINT + author.profileImageUrl;

    // [삭제 버튼 클릭]
    const handleDeletePost = () => {
        const isConfirmed = window.confirm("게시물을 삭제할까요?\n삭제 후 복구할 수 없습니다.");

        if(isConfirmed){
            deletePost({postId, userId: author.userId});
        }
    };

    return(
        <header className="flex justify-between items-center">
            {/* 왼쪽: 프로필 및 정보 */}
            <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate(ROUTES.PROFILE.LINK(author.userId))}
            >
                <img
                    src={finalImage || DEFAULT_PROFILE}
                    alt={`${author.nickname} 프로필`}
                    className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                    onError={(e) => {e.currentTarget.src = DEFAULT_PROFILE}}
                />
                <div className="flex flex-col gap-0.5">
                    <span className="text-[15px] font-semibold text-[#2b2b31] leading-tight">
                        {author.nickname}
                    </span>
                    <span className="text-xs text-[#a7a7ae]">
                        {formatFeedDate(createdAt)}
                    </span>
                </div>
            </div>

            {/* 오른쪽: 내 글일 경우에만 수정 and 삭제 버튼 노출 */}
            {isAuthor && (
                <div className="flex gap-2">
                    <button
                        className="px-3 py-1.5 rounded-lg bg-[#f4f4f6] text-xs text-[#7a7a82] hover:bg-[#eaeaed] cursor-pointer transition-colors"
                        onClick={() => openEditModal(postId)}
                    >
                        수정
                    </button>
                    <button
                        className="px-3 py-1.5 rounded-lg bg-[#f4f4f6] text-xs text-[#7a7a82] hover:bg-[#eaeaed] cursor-pointer transition-colors disabled:opacity-50"
                        onClick={handleDeletePost}
                        disabled={isPending}
                    >
                        {isPending ? '⌛' : '삭제'}
                    </button>
                </div>
            )}
        </header>
    );
};