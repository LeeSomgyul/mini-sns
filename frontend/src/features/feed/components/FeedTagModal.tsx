import { useNavigate } from "react-router-dom";
import { useFeedTags } from "../hooks/useFeedTags";
import { ROUTES } from "../../../constants/routes";
import { getProfileImageUrl } from "../../../common/utils/randomProfileImage";

interface FeedTagModalProps {
    postId: number;
    isOpen: boolean;
    onClose: () => void;
}

export const FeedTagModal = ({postId, isOpen, onClose}: FeedTagModalProps) => {

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
                className="animate-modal-rise w-full max-w-[400px] h-[500px] flex flex-col rounded-3xl border border-white/60 bg-white/95 backdrop-blur-xl shadow-[0_12px_32px_rgba(30,30,45,0.12)] p-0 overflow-hidden"
            >
                {/* 헤더: 태그 헤더, 닫기 버튼 */}
                <header className="flex justify-between items-center px-6 py-4 border-b border-black/5">
                    <h3 className="m-0 text-lg font-semibold text-[#2b2b31]">태그</h3>
                    <button
                        aria-label="Close"
                        rel="prev"
                        onClick={onClose}
                         className="flex items-center justify-center w-8 h-8 rounded-[10px] hover:bg-black/10 cursor-pointer transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-5 text-[black/5]">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                {/* 태그 리스트 영역 (스크롤 처리) */}
                <div className="flex-1 flex flex-col overflow-hidden min-h-0 mb-5 ">
                    {isLoading ? (
                        <div aria-busy="true" className="flex-1 flex items-center justify-center text-sm text-[#8b8b92]">
                            데이터를 불러오는 중...
                        </div>
                    ) : taggedUsers.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-sm text-[#a7a7ae] py-8">
                            태그된 사용자가 없습니다.
                        </div>
                    ) : (
                        <ul className="list-none p-0 m-0 py-2 space-y-1 h-[500px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black/15 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-black/30">
                            {taggedUsers.map((user) => {
                                const profileImageUrl = getProfileImageUrl({
                                    profileImageUrl: user.profileImageUrl,
                                    userId: user.userId,
                                });
                                return(
                                    <li
                                    key={user.userId}
                                    onClick={() => handleUserClick(user.userId)}
                                    className="flex items-center mx-2 px-4 py-2.5 rounded-xl cursor-pointer hover:bg-[#EAF6FD] transition-colors"
                                >
                                    <img
                                        src={profileImageUrl}
                                        alt={`${user.nickname} 프로필`}
                                        className="w-11 h-11 rounded-full object-cover mr-4 border border-black/10"
                                    />
                                    <div className="flex flex-col min-w-0">
                                        <strong className="text-sm font-semibold text-[#2b2b31] truncate">
                                            {user.nickname}
                                        </strong>
                                        <small className="text-xs text-[#a7a7ae] truncate">
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