import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProfile } from '../features/profile/hooks/useProfile';
import { useAuthStore } from '../features/auth/store/authStore';

import { ProfileHeader } from '../features/profile/components/ProfileHeader';
import { ProfileMediaGrid } from '../features/profile/components/ProfileMediaGrid';
import { ProfileFeedDetail } from '../features/profile/components/ProfileFeedDetail';

export const ProfilePage = () => {
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
    
    // 초기 진입 시 0번째 게시물 자동 선택
    useEffect(() => {
        // 1. 이미 선택된 게시물이 있다면 아무것도 안함
        if(selectedPostId !== null) return;

        // 2. 첫번째 게시물의 존재 확인
        const firstThumbnail = postData?.thumbnails?.[0];

        if(firstThumbnail && firstThumbnail.postId){
            setSelectedPostId(firstThumbnail.postId);
        }
    },[postData, selectedPostId]);

    if (isLoading) {
        return <div aria-busy="true" style={{ textAlign: 'center', marginTop: '50px' }}>프로필 데이터를 불러오는 중입니다...</div>;
    }

    if (isError || !userData || !postData) {
        return <div className="container">프로필을 불러오는데 실패했습니다.</div>;
    }
    

    // [썸네일 클릭 시 변경 핸들러]
    const handleThumbnailSelect = (postId: number) => {
        setSelectedPostId(postId);

        // 화면을 맨 위로 올리기
        window.scrollTo({ top: 0, behavior: 'smooth'});
    };


    return (
        <main className="container" style={{ display: 'flex', height: '100vh', gap: '2rem', padding: '1rem' }}>
            {/* 왼쪽: 피드 영역 */}
            <section style={{ flex: 2, overflowY: 'auto', paddingRight: '1rem' }}>
                <ProfileFeedDetail postId={selectedPostId}/>
            </section>

            {/* 오른쪽: 사용자 프로필 영역 */}
            <aside style={{ flex: 1, minWidth: '300px', height: '100%', overflowY: 'auto' }}>
                <article style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1rem' }}>
                    <ProfileHeader userData={userData} postCount={postData.postCount} />
                    <hr style={{ margin: '1rem 0' }} />
                    
                    <ProfileMediaGrid 
                        thumbnails={postData.thumbnails} 
                        onThumbnailSelect={handleThumbnailSelect} 
                        fetchNextPage={fetchNextPage}
                        hasNextPage={hasNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                    />
                </article>
            </aside>
        </main>
    );
};

export default ProfilePage;