//[컴포넌트] 게시물 로딩중일때 화면
//@param count: 로딩 스켈레톤 개수 (FeedCardSkeleton를 3개 보여주기)
export const FeedTopLoading = ({count = 3}: {count?: number}) => {
    return(
        <>
            {Array.from({length: count}).map((_,i) => (
                <FeedCardSkeleton key={i}/>
            ))}
        </>
    );
};

//[컴포넌트] 무한 스크롤 하단 로딩중일때 문구
export const FeedBottomLoading = () => {
    return(
        <div style={{ textAlign: 'center', padding: '1rem' }}>
            <p aria-busy="true">다음 게시물을 가져오는 중...</p>
        </div>
    );
};

//[FeedTopLoading 로딩 UI] 게시물 1개에서 헤더, 미디어, 텍스트 영역 나눠서 스켈레톤 보여주기
const FeedCardSkeleton = () => (
    <article style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #e1e4e8' }}>
        {/* 헤더 영역 스켈레톤 */}
        <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div className="skeleton-circle" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#eee' }} />
            <div style={{ flex: 1 }}>
                <div className="skeleton-bar" style={{ width: '30%', height: '12px', backgroundColor: '#eee', marginBottom: '8px' }} />
                <div className="skeleton-bar" style={{ width: '20%', height: '10px', backgroundColor: '#eee' }} />
            </div>
        </header>

        {/* 미디어 영역 스켈레톤*/}
        <div className="skeleton-media" style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#f5f5f5', marginBottom: '1rem' }} />

        {/* 하단 텍스트 영역 스켈레톤 */}
        <footer>
            <div className="skeleton-bar" style={{ width: '90%', height: '12px', backgroundColor: '#eee', marginBottom: '8px' }} />
            <div className="skeleton-bar" style={{ width: '60%', height: '12px', backgroundColor: '#eee' }} />
        </footer>

        {/* 임시 스켈레톤 애니메이션 CSS */}
        <style>{`
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.4; }
                100% { opacity: 1; }
            }
            .skeleton-circle, .skeleton-bar, .skeleton-media {
                animation: pulse 1.5s infinite ease-in-out;
            }
        `}</style>
    </article>
);

