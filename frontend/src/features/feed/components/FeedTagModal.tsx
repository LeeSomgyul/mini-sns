import { useNavigate } from "react-router-dom";
import { useFeedTags } from "../hooks/useFeedTags";
import { ROUTES } from "../../../constants/routes";

interface FeedTagModalProps {
    postId: number;
    isOpen: boolean;
    onClose: () => void;
}

export const FeedTagModal = ({postId, isOpen, onClose}: FeedTagModalProps) => {

    const DEFAULT_PROFILE = `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image.png`;

    const navigate = useNavigate();
    const { taggedUsers, isLoading } = useFeedTags(postId, isOpen);

    if(!isOpen) return null;

    const handleUserClick = (userId: number) => {
        onClose();
        navigate(ROUTES.PROFILE.LINK(userId));
    };

    return(
        <dialog
            open
            onClick={onClose}
            className="fixed inset-0 z-[999] m-0 flex h-full w-full max-h-none max-w-none items-center justify-center bg-black/40 p-0"
        >
            <article
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[400px] rounded-3xl border border-white/60 bg-white/95 backdrop-blur-xl shadow-[0_12px_32px_rgba(30,30,45,0.12)] p-0 overflow-hidden"
            >
                {/* 헤더: 태그 헤더, 닫기 버튼 */}
                <header className="flex justify-between items-center px-6 py-4 border-b border-black/5">
                    <h3 className="m-0 text-lg font-semibold text-[#2b2b31]">태그</h3>
                    <button
                        aria-label="Close"
                        rel="prev"
                        onClick={onClose}
                        className="m-0 border-0 bg-transparent text-[#2b2b31] cursor-pointer text-lg leading-none"
                    >
                        ✕
                    </button>
                </header>

                {/* 태그 리스트 영역 (스크롤 처리) */}
                <div className="max-h-[60vh] overflow-y-auto py-2">
                    {isLoading ? (
                        <div aria-busy="true" className="text-center py-8 text-sm text-[#8b8b92]">
                            데이터를 불러오는 중...
                        </div>
                    ) : taggedUsers.length === 0 ? (
                        <div className="text-center text-sm text-[#a7a7ae] py-8">
                            태그된 사용자가 없습니다.
                        </div>
                    ) : (
                        <ul className="list-none p-0 m-0">
                            {taggedUsers.map((user) => {
                                const finalImage = user.profileImageUrl !== null
                                        ? user.profileImageUrl
                                        : DEFAULT_PROFILE;
                                return(
                                    <li
                                    key={user.userId}
                                    onClick={() => handleUserClick(user.userId)}
                                    className="flex items-center px-6 py-3 cursor-pointer border-b border-black/5 last:border-b-0 hover:bg-[#f4f4f6] transition-colors"
                                >
                                    <img
                                        src={finalImage}
                                        alt={`${user.nickname} 프로필`}
                                        className="w-11 h-11 rounded-full object-cover mr-4"
                                    />
                                    <div className="flex flex-col">
                                        <strong className="text-sm font-semibold text-[#2b2b31]">
                                            {user.nickname}
                                        </strong>
                                        <small className="text-xs text-[#a7a7ae]">
                                            {user.name}
                                        </small>
                                    </div>
                                </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </article>
        </dialog>
    );
};