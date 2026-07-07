import { useEffect, useRef, useState } from "react";
import { useFeedInfiniteQuery } from "../hooks/useFeedInfiniteQuery";
import { useDebounce } from "../../../common/hook/useDebounce";
import { FeedBottomLoading, FeedTopLoading } from "./FeedLoading";
import { FeedError } from "./FeedError";
import { FeedEmpty } from "./FeedEmpty";
import { FeedCard } from "./FeedCard";
import { useCommentStore } from "../store/useCommentStore";

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

    // [전역 상태] 댓글창 오픈 여부 가져오기
    const activePostId = useCommentStore((state) => state.activePostId);
    const toggleCommentSide = useCommentStore((state) => state.toggleCommentSide);
    const isCommentOpen = activePostId !== null;

    // [스크롤 상태] 디바운스 0.8초 적용
    const [scrolledPostId, setScrolledPostId] = useState<number | null>(null);
    const debouncedScrolledPostId = useDebounce<number | null>(scrolledPostId, 800);

    // [센서] 바닥 감지 센서
    const observerRef = useRef<HTMLDivElement | null>(null);

    // [센서] 중앙 피드 감지 센서
    const centerObserverRef = useRef<IntersectionObserver | null>(null);

    // [기능] 0.5초 동안 한 게시물에 정착하면 우측 댓글창 데이터 실시간 교체
    useEffect(() => {
        if(!isCommentOpen || !debouncedScrolledPostId || debouncedScrolledPostId === activePostId) return;

        toggleCommentSide(debouncedScrolledPostId);
    },[debouncedScrolledPostId, isCommentOpen, activePostId, toggleCommentSide]);

    // [기능] 우측 댓글창이 열려있을 때만 중앙 센서를 인식
    useEffect(() => {
        // 1. 댓글창이 열려있지 않으면 센서 작동 끄기
        if (!isCommentOpen) {
            if (centerObserverRef.current) centerObserverRef.current.disconnect();
            return;
        }

        // 2. 화면 중앙을 감시하는 센서 생성
        centerObserverRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    // 특정 게시물이 감지 영역에 교차했는지 확인
                    if (entry.isIntersecting) {
                        const targetId = Number(entry.target.getAttribute('data-post-id'));
                        if (targetId) {
                            // postId 저장
                            setScrolledPostId(targetId); 
                        }
                    }
                });
            },
            {
                // 화면 중앙 40% 영역에 들어오면 감지
                root: null,
                rootMargin: '-30% 0px -30% 0px',
                threshold: 0.1
            }
        );

        // 3. 화면에 있는 모든 게시물 카드들을 찾아내서 감시 카메라 붙이기
        const feedCards = document.querySelectorAll('.feed-card-item');
        feedCards.forEach((card) => centerObserverRef.current?.observe(card));

        // 4. 댓글창 닫히면 센서 종료 (메모리 누수 막기)
        return () => {
            if (centerObserverRef.current) centerObserverRef.current.disconnect();
        };
    }, [isCommentOpen, data]);

    // [기능] 화면에서 observerRef가 보이면 다음 페이지 요청
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
                <div 
                    key={post.postId} 
                    className="feed-card-item" 
                    data-post-id={post.postId}
                >
                    <FeedCard post={post} />
                </div>
            ))}

            {/* 무한 스크롤 바닥 센서 */}
            <div ref={observerRef} style={{ height: '50px', marginBottom: '2rem' }}>
                {isFetchingNextPage && <FeedBottomLoading/>}
            </div>
        </section>
    );
};