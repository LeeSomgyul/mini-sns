import { useEffect, useRef } from "react";
import { useFeedInfiniteQuery } from "../hooks/useFeedInfiniteQuery";
import { FeedBottomLoading, FeedTopLoading } from "./FeedLoading";
import { FeedError } from "./FeedError";
import { FeedEmpty } from "./FeedEmpty";
import { FeedCard } from "./FeedCard";

//[메인 컨테이너] FeedCard를 리스트로 출력 및 무한 스크롤
export const FeedList = () => {

    //무한스크롤 훅 가져오기
    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useFeedInfiniteQuery();

    //바닥 감지 센서
    const observerRef = useRef<HTMLDivElement | null>(null);

    //화면에서 observerRef가 보이면 다음 페이지 요청
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if(entries[0].isIntersecting && hasNextPage && !isFetchingNextPage){
                    fetchNextPage();
                }
            },
            {threshold: 0.5}
        );

        if(observerRef.current) observer.observe(observerRef.current);

        return () => observer.disconnect();
    },[hasNextPage, isFetchingNextPage, fetchNextPage]);

    // [FeedLoading + FeedError + FeedEmpty 조립]
    // 1.최초 로딩 시 (스켈레톤 3개 노출)
    if(isLoading) return <FeedTopLoading count={3}/>;

    // 2.에러 발생 시 재시도 버튼
    if(isError) return <FeedError message={error?.message} onRetry={refetch}/>;

    // 3.pages 배열을 평탄화
    const allPosts = data?.pages.flatMap(page => page.posts) || [];

    // 4.데이터가 0개일 경우
    if(allPosts.length === 0) return <FeedEmpty/>;

    return(
        <section style={{ position: 'relative', maxWidth: '600px', margin: '0 auto', paddingTop: '3rem' }}>
            {/* 조립된 FeedCard 배치 */}
            {allPosts.map((post) => (
                <FeedCard
                    key={post.postId}
                    post={post}
                />
            ))}

            {/* 무한 스크롤 바닥 센서 */}
            <div ref={observerRef} style={{ height: '50px', marginBottom: '2rem' }}>
                {isFetchingNextPage && <FeedBottomLoading/>}
            </div>
        </section>
    );
};