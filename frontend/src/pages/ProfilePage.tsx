import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useProfile } from '../features/profile/hooks/useProfile';
import { useAuthStore } from '../features/auth/store/authStore';

import { ProfileHeader } from '../features/profile/components/ProfileHeader';
import { ProfileMediaGrid } from '../features/profile/components/ProfileMediaGrid';
import { ProfileFeedDetail } from '../features/profile/components/ProfileFeedDetail';
import { useCommentStore } from "../common/store/useCommentStore";
import { FeedCommentSidebar } from '../features/feed/components/FeedCommentSidebar';

export const ProfilePage = () => {
    
    // [댓글 전역 상태 연결] postId, 댓글창 닫기
    const activePostId = useCommentStore((state) => state.activePostId);
    const closeCommentSide = useCommentStore((state) => state.closeCommentSide);

    const { userId: paramUserId } = useParams<{ userId: string }>();
    const { myUserId } = useAuthStore();
    
    const targetUserId = paramUserId ? Number(paramUserId) : myUserId;

    // [탄스택쿼리 호출 (비동기)]
    const { 
        userData,
        postData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError
    } = useProfile(targetUserId!);

    // 사용자가 클릭한 그리들의 썸네일 
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

    // 이전 최신글 id 기억
    const prevLatestPostIdRef = useRef<number | null>(null);
    
    // 초기 진입 시 0번째 게시물 자동 선택
    useEffect(() => {
        // 1. 데이터가 아예 없으면 자동 선택 불가
        if(!postData?.thumbnails || postData.thumbnails.length === 0){
            setTimeout(() => {
                setSelectedPostId(null);
            }, 0);
            prevLatestPostIdRef.current = null;
            return;
        }

        // 프로필 우측 그리들의 최신 0번째 게시물
        const latestPostId = postData.thumbnails[0]?.postId;

        // 2. 현재 선택된 postId가 우측 그리드에 여전히 존재하는지 검사
        const isCurrentPostValid = postData.thumbnails.some(
            (thumb) => thumb.postId === selectedPostId
        );

        const isNewPostAdded = 
            prevLatestPostIdRef.current !== null &&
            prevLatestPostIdRef.current !== latestPostId;

        
            // 3. 만약 초기 진입 상태가 null 이거나 방금 삭제되었다면 새 데이터로 교체
        if(selectedPostId === null || !isCurrentPostValid || isNewPostAdded){
            if (latestPostId) {
                setTimeout(() => {
                    setSelectedPostId(latestPostId);
                }, 0);
            }
        }

        if(latestPostId){
            prevLatestPostIdRef.current = latestPostId;
        }
    },[postData, selectedPostId]);

    if (isLoading) {
        return (
            <div aria-busy="true" className="flex h-[calc(100vh-4rem)] items-center justify-center text-sm text-[#8b8b92]">
                프로필 데이터를 불러오는 중입니다...
            </div>
        );
    }

    if (isError || !userData || !postData) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-sm text-red-500">
                프로필을 불러오는데 실패했습니다.
            </div>
        );
    }


    // [썸네일 클릭 시 변경 핸들러]
    const handleThumbnailSelect = (postId: number) => {
        setSelectedPostId(postId);

        // 화면을 맨 위로 올리기
        window.scrollTo({ top: 0, behavior: 'smooth'});
    };


    return (
        <main className="flex justify-center items-start gap-7 h-[calc(100vh-4rem)]">
            {/* 왼쪽: 피드 영역 (내부 스크롤) */}
            <section className="w-full max-w-[640px] h-full overflow-y-auto pb-10 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-black/15 transition-colors">
                <ProfileFeedDetail
                    postId={selectedPostId}
                    onDeleteSuccess={() => setSelectedPostId(null)}
                />
            </section>

            {/* 오른쪽: 게시물 댓글 or 프로필 정보 영역 (내부 스크롤, 화면 높이에 맞춰 잘리지 않음) */}
            <aside className="hidden lg:block w-[400px] shrink-0 h-full py-6">
                <div className="h-full rounded-[20px] bg-white/90 backdrop-blur-xl border border-white/60 shadow-[0_10px_26px_rgba(30,30,45,0.06)] overflow-hidden">
                    {activePostId !== null ? (
                        <FeedCommentSidebar
                            postId={activePostId}
                            onClose = {closeCommentSide}
                        />
                    ) : (
                        <div className="flex flex-col h-full">
                            {/* 상단 고정: 프로필 정보 */}
                            <div className="px-5 pt-5 pb-4 border-b border-black/5">
                                <ProfileHeader userData={userData} postCount={postData.postCount} />
                            </div>

                            {/* 하단 스크롤: 게시물 썸네일 그리드 */}
                            <div className="flex-1 overflow-y-auto p-5 mb-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-black/15 transition-colors">
                                <ProfileMediaGrid
                                    thumbnails={postData.thumbnails}
                                    onThumbnailSelect={handleThumbnailSelect}
                                    fetchNextPage={fetchNextPage}
                                    hasNextPage={hasNextPage}
                                    isFetchingNextPage={isFetchingNextPage}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </main>
    );
};

export default ProfilePage;