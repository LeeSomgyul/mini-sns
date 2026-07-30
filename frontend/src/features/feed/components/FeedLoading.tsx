//[컴포넌트] 게시물 로딩중일때 화면
//@param count: 로딩 스켈레톤 개수 (FeedCardSkeleton를 3개 보여주기)
export const FeedTopLoading = ({count = 3}: {count?: number}) => {
    return(
        <div className="flex flex-col gap-6 pt-6">
            {Array.from({length: count}).map((_,i) => (
                <FeedCardSkeleton key={i}/>
            ))}
        </div>
    );
};

//[컴포넌트] 무한 스크롤 하단 로딩중일때 문구
export const FeedBottomLoading = () => {
    return(
        <div className="text-center py-4">
            <p aria-busy="true" className="text-sm text-[#a7a7ae]">다음 게시물을 가져오는 중...</p>
        </div>
    );
};

//[FeedTopLoading 로딩 UI] 게시물 1개에서 헤더, 미디어, 텍스트 영역 나눠서 스켈레톤 보여주기
const FeedCardSkeleton = () => (
    <article className="rounded-3xl border border-white/60 bg-white/90 backdrop-blur-xl shadow-[0_12px_32px_rgba(30,30,45,0.07)] p-5">
        {/* 헤더 영역 스켈레톤 */}
        <header className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-full bg-[#eee] animate-pulse" />
            <div className="flex-1">
                <div className="w-[30%] h-3 rounded bg-[#eee] mb-2 animate-pulse" />
                <div className="w-[20%] h-2.5 rounded bg-[#eee] animate-pulse" />
            </div>
        </header>

        {/* 미디어 영역 스켈레톤*/}
        <div className="w-full aspect-square rounded-2xl bg-[#f5f5f5] mb-4 animate-pulse" />

        {/* 하단 텍스트 영역 스켈레톤 */}
        <footer>
            <div className="w-[90%] h-3 rounded bg-[#eee] mb-2 animate-pulse" />
            <div className="w-[60%] h-3 rounded bg-[#eee] animate-pulse" />
        </footer>
    </article>
);

