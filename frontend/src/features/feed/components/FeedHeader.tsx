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
                    className="w-11 h-11 rounded-full object-cover flex-shrink-0 border border-black/10"
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
                <div className="flex gap-1">
                    <button
                        className="px-1.5 py-1.5 rounded-lg  text-xs text-[#7a7a82] hover:bg-[#eaeaed] cursor-pointer transition-colors"
                        onClick={() => openEditModal(postId)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 text-[black/5]">
                            <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                            <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                        </svg>
                    </button>
                    <button
                        className="px-1.5 py-1.5 rounded-lg text-xs text-[#7a7a82] hover:bg-[#eaeaed] cursor-pointer transition-colors disabled:opacity-50"
                        onClick={handleDeletePost}
                        disabled={isPending}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-5 text-[#FF4D4F]">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    </button>
                </div>
            )}
        </header>
    );
};