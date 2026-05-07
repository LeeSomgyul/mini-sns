import { useUserSearchQuery } from '../hooks/useUserSearchQuery';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

interface SearchResultProps {
    keyword: string;
}

export const SearchResult = ({ keyword }: SearchResultProps) => {
    const DEFAULT_PROFILE = `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image.png`;

    const {
        data,//실제 화면에 보일 데이터
        isLoading,//api에서 response로 가져오는중 여부
        isError,//에러 발생 여부
        isFetchingNextPage,//다음 페이지 가져오는 중인지 여부
        hasNextPage,//다음 페이지 존재 여부
        fetchNextPage,//다음 페이지 가져오는 함수
        refetch//새로고침 등 이유로 데이터 다시 가져오기 
    } = useUserSearchQuery(keyword);

    const observerRef = useInfiniteScroll({
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
        rootMargin: '200px'
    });


    if (!keyword) {
        return (
            <div>
                <p style={{ textAlign: 'center', color: 'gray' }}>
                    사용자의 이름이나 닉네임을 입력해주세요.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <button aria-busy="true" className="secondary" disabled>검색 중...</button>
            </div>
        );
    }

    if (isError) {
        return (
            <article className="error">
                <p>검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
                <button onClick={() => refetch()}>재시도</button>
            </article>
        );
    }

    const users = data?.pages?.flatMap((page) => page?.content || []) || [];

    if (users.length === 0) {
        return (
            <article>
                <p style={{ textAlign: 'center' }}>검색 결과가 없습니다.</p>
            </article>
        );
    }

    return (
        <section>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {users.map((user) => {
                    if (!user) return null;
                    return (
                        <div
                            key={user.userId}
                            style={{ display: 'flex', alignItems: 'center', padding: '0.5rem', cursor: 'pointer', borderBottom: '1px solid var(--pico-muted-border-color)' }}
                            onClick={() => console.log(`${user.userId}번 프로필로 이동`)} // 🚨🚨 프로필 구현 후 연결 🚨🚨
                        >
                            <div style={{ width: '50px', height: '50px', marginRight: '1rem' }}>
                                <img
                                    src={user.profileImageUrl || DEFAULT_PROFILE}
                                    onError={(e) => { e.currentTarget.src = DEFAULT_PROFILE; }}
                                    alt={user.nickname}
                                    style={{ borderRadius: '50%', objectFit: 'cover', width: '100%', height: '100%' }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <strong style={{ fontSize: '1rem' }}>{user.nickname}</strong>
                                <small style={{ color: 'var(--pico-muted-color)' }}>{user.name}</small>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div ref={observerRef} style={{ height: '40px', marginTop: '1rem', textAlign: 'center' }}>
                {isFetchingNextPage && <span aria-busy="true">불러오는 중...</span>}
            </div>
        </section>
    );
};