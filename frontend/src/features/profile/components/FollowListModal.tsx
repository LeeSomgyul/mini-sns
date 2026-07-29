import { useEffect, useRef, useState } from "react";
import { useFollowListInfiniteQuery } from "../hooks/useFollowListInfiniteQuery";
import { FollowListItem } from "./FollowListItem";

interface FollowListModalProps{
    type: 'followings' | 'followers';
    userId: number;
    onClose: () => void;
}

// [팔로우 및 팔로워 리스트 조회]
export const FollowListModal = ({type, userId, onClose}: FollowListModalProps) => {
    // [상태]
    // 1. 리스트에서 '언팔로우' 요청한 사람들 리스트
    const [ unfollowUserIds, setUnfollowUserIds ] = useState<number[]>([]);

    // [훅 호출]
    // 1. 리스트 무한스크롤 조회
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading
    } = useFollowListInfiniteQuery({type, userId});

    // [무한스크롤] 스크롤 감시 div 생성
    const observerRef = useRef<HTMLDivElement | null>(null);

    // [무한스크롤]
    useEffect(() => {
        // div 상자가 인식되지 않거나, 다음 가져올 페이지가 없다면 넘어가기
        if(!observerRef.current || !hasNextPage) return;

        // div 상자 인식되면 다음 페이지 데이터 가져오기
        const observe = new IntersectionObserver(
            (entries) => {
                if(entries[0].isIntersecting && hasNextPage && !isFetchingNextPage){
                    fetchNextPage();
                }
            },
            // div 상자가 완전히 보일 때 데이터 가져오기
            {threshold: 1.0}
        );

        // div에 센서 부착
        observe.observe(observerRef.current);

        // 모달이 꺼지면 제거
        return () => {
            observe.disconnect();
        };

    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    // [데이터 변형] 백엔드에서 가져온 FollowUserResponse 안의 FollowContentDto 만 가져오기
    const followList = data?.pages.flatMap((page) => page.content) || [];

    const handleToggletUnfollow = (targetId: number, shouldAdd: boolean) => {
        setUnfollowUserIds((prev) => 
            shouldAdd
                ? [...prev, targetId]
                : prev.filter((id) => id !== targetId)
        )
    };

    return(
        <dialog
            open
            onClick={onClose}
            className="fixed inset-0 z-[999] m-0 flex h-full w-full max-h-none max-w-none items-center justify-center bg-black/40 p-0"
        >
            <article
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[350px] rounded-3xl border border-white/60 bg-white/95 backdrop-blur-xl shadow-[0_12px_32px_rgba(30,30,45,0.12)] p-0 overflow-hidden"
            >
                {/* 상단 헤더 (리스트 이름 / 모달 닫기 버튼) */}
                <header className="flex justify-between items-center px-6 py-4 border-b border-black/5">
                    <strong className="text-lg font-semibold text-[#2b2b31]">
                        {type === 'followings' ? '팔로잉' : '팔로워'}
                    </strong>
                    <button
                        aria-label="Close"
                        onClick={onClose}
                        className="flex items-center justify-center w-8 h-8 rounded-[10px] hover:bg-black/10 cursor-pointer transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 text-[#2b2b31]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                {/* 팔로잉 & 팔로워 리스트 */}
                {isLoading ? (
                    // 데이터를 가져오는 중이라면...
                    <p aria-busy="true" className="text-center py-8 text-sm text-[#8b8b92]">불러오는 중...</p>
                ) : followList.length === 0 ? (
                    // 팔로잉 & 팔로우 리스트가 없다면
                    <p className="text-center h-[350px] py-35 text-sm text-[#a7a7ae]">
                        아직 {type === 'followings' ? '팔로잉하는 사람이' : '나를 팔로우한 사람이'} 없습니다.
                    </p>
                ) : (
                    // 팔로잉 & 팔로우 리스트가 있다면
                    <div className="h-[350px] overflow-y-auto px-3 py-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-black/15 transition-colors">
                        <ul className="list-none p-0 m-0">
                            {followList.map((user) => (
                                <FollowListItem
                                    key={user.userId}
                                    user={user}
                                    type={type}
                                    isCurrentlyUnfollowed={unfollowUserIds.includes(user.userId)}
                                    onToggleUnfollow={handleToggletUnfollow}
                                    onCloseModal={onClose}
                                />
                            ))}
                        </ul>

                        {/* 무한스크롤 div 센서 */}
                        <div ref={observerRef} className="h-8 flex justify-center items-center mt-2">
                            {isFetchingNextPage && (
                                <p aria-busy="true" className="text-xs text-[#8b8b92] m-0">더 가져오는 중...</p>
                            )}
                        </div>
                    </div>
                )}
            </article>
        </dialog>
    );
};