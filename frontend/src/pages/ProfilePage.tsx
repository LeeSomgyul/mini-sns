import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useProfile } from '../features/profile/hooks/useProfile';
import { useAuthStore } from '../features/auth/store/authStore';

import { ProfileHeader } from '../features/profile/components/ProfileHeader';
import { ProfileMediaGrid } from '../features/profile/components/ProfileMediaGrid';
import { FeedCard } from '../features/feed/components/FeedCard';
import type { PostDto } from '../features/feed/types/feedResponseType';

export const ProfilePage = () => {
    const { userId: paramUserId } = useParams<{ userId: string }>();
    const { myUserId } = useAuthStore();
    
    const targetUserId = paramUserId ? Number(paramUserId) : myUserId;

    // [탄스택쿼리 호출 (비동기)]
    const { userData, postData, isLoading, isError } = useProfile(targetUserId!);
    // 사용자가 클릭한 그리들의 썸네일 
    const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
    const profileScrollRef = useRef<HTMLElement>(null);

    // 공통 가상 PostDto 빌더 함수
    // 🚨api 생성 뒤 바꾸기🚨
    const createVirtualPost = (url: string, currentPostId: number): PostDto => {
        return {
            postId: currentPostId,
            author: {
                userId: userData?.userId ?? 0,
                nickname: userData?.nickname ?? "이름 없음",
                profileImageUrl: userData?.profileImageUrl ?? null
            },
            content: "프로필에서 선택한 게시물입니다.",
            media: [{
                mediaUrl: url,
                type: "IMAGE",
                thumbnailUrl: null,
                sortOrder: 0,
                status: "COMPLETED",
                cropState: null
            }],
            commentCount: 0,
            likeCount: 0,
            isLiked: false,
            isAuthor: myUserId !== null && userData?.userId === myUserId, 
            createdAt: "방금 전"
        };
    };

    if (isLoading) {
        return <div aria-busy="true" style={{ textAlign: 'center', marginTop: '50px' }}>프로필 데이터를 불러오는 중입니다...</div>;
    }

    if (isError || !userData || !postData) {
        return <div className="container">프로필을 불러오는데 실패했습니다.</div>;
    }

    const selectedPost: PostDto | null = (postData && postData.thumbnails.length > 0 && userData)
        ? createVirtualPost(
            selectedUrl || postData.thumbnails[0], // 클릭한 게 있다면 그걸 쓰고, 없다면 최신순(0번째) 썸네일을 기본 노출
            selectedUrl ? 99999 : 0 // 클릭 유무에 따른 임시 가상 ID 부여
          )
        : null;
    

    // [썸네일 클릭 시 변경 핸들러]
    const handleThumbnailSelect = (url: string) => {
        setSelectedUrl(url); // 클릭한 URL로 업데이트 -> 컴포넌트 리렌더링 유발

        if (profileScrollRef.current) {
            profileScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };


    return (
        <main className="container" style={{ display: 'flex', height: '100vh', gap: '2rem', padding: '1rem' }}>
            {/* 왼쪽: 피드 영역 */}
            <section ref={profileScrollRef} style={{ flex: 2, overflowY: 'auto', paddingRight: '1rem' }}>
                {selectedPost ? (
                    <FeedCard post={selectedPost} />
                ) : (
                    <article style={{ textAlign: 'center', padding: '3rem' }}>
                        <p>게시물이 없습니다.</p>
                    </article>
                )}
            </section>

            {/* 오른쪽: 사용자 프로필 영역 */}
            <aside style={{ flex: 1, minWidth: '300px', height: '100%', overflowY: 'auto' }}>
                <article style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1rem' }}>
                    <ProfileHeader userData={userData} postCount={postData.postCount} />
                    <hr style={{ margin: '1rem 0' }} />
                    <ProfileMediaGrid thumbnails={postData.thumbnails} onThumbnailSelect={handleThumbnailSelect} />
                </article>
            </aside>
        </main>
    );
};

export default ProfilePage;