import { useEffect, useRef, useState } from "react";
import { useFollowListInfiniteQuery } from "../hooks/useFollowListInfiniteQuery";
import { useFollowMutation } from "../hooks/useFollowMutation";
import { useUnfollowMutation } from "../hooks/useUnfollowMutation";

interface FollowListModalProps{
    type: 'followings' | 'followers';
    userId: number;
    onClose: () => void;
}

// [팔로우 및 팔로워 리스트 조회]
export const FollowListModal = ({type, userId, onClose}: FollowListModalProps) => {

    const MINIO_MEDIA_ENDPOINT = `${import.meta.env.VITE_MINIO_MEDIA_ENDPOINT}/`;
    const DEFAULT_PROFILE = `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image.png`;

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

    // 2. 팔로우 & 언팔로우 
    const {mutate: follow} = useFollowMutation({
        onSuccess: () => {
            
        },
        onError: () => {}
    });
    const {mutate: unfollow} = useUnfollowMutation({
        onSuccess: () => {},
        onError: () => {}
    });

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

    return(
        <dialog open style={{ maxWidth: '450px', width: '100%', border: 'none', background: 'transparent' }}>
            <article style={{ margin: 0, padding: '1.5rem' }}>
                {/* 상단 헤더 (리스트 이름 / 모달 닫기 버튼) */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <strong style={{ fontSize: '1.2rem' }}>
                        {type === 'followings' ? '팔로잉 목록' : '팔로워 목록'}
                    </strong>
                    <a href="#close" aria-label="Close" rel="prev" onClick={onClose} style={{ textDecoration: 'none' }}></a>
                </header>

                {/* 팔로잉 & 팔로워 리스트 */}
                {isLoading ? (
                    // 데이터를 가져오는 중이라면...
                    <p aria-busy="true" style={{ textAlign: 'center', padding: '2rem 0' }}>목록을 불러오는 중...</p>
                ) : followList.length === 0 ? (
                    // 팔로잉 & 팔로우 리스트가 없다면
                    <p style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--pico-muted-color)' }}>
                        아직 {type === 'followings' ? '팔로잉하는 사람이' : '나를 팔로우한 사람이'} 없습니다.
                    </p>
                ) : (
                    // 팔로잉 & 팔로우 리스트가 있다면
                    <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {followList.map((user) => {
                                const finalImage = user.profileImageUrl !== null
                                    ? MINIO_MEDIA_ENDPOINT+user.profileImageUrl
                                    : DEFAULT_PROFILE;
                
                                return(
                                <li 
                                    key={user.userId} 
                                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid var(--pico-border-color)' }}
                                >
                                    <img
                                        src={finalImage} 
                                        alt={`${user.nickname} 프로필 이미지`}
                                        style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <strong style={{ display: 'block', fontSize: '1rem' }}>{user.nickname}</strong>
                                        <small style={{ color: 'var(--pico-muted-color)', fontSize: '0.85rem' }}>{user.name}</small>
                                    </div>
                                </li>
                                );
                            })}
                        </ul>

                        {/* 무한스크롤 div 센서 */}
                        <div ref={observerRef} style={{ height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                            {isFetchingNextPage && (
                                <p aria-busy="true" style={{ fontSize: '0.85rem', margin: 0 }}>더 가져오는 중...</p>
                            )}
                        </div>
                    </div>
                )}
            </article>
        </dialog>
    );
};