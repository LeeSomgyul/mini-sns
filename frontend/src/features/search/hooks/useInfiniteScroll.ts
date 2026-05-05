import { useEffect, useRef } from 'react';

interface UseIntersectionObserverProps {
    hasNextPage: boolean | undefined;// 다음 페이지가 있는지 여부
    isFetchingNextPage: boolean;// 현재 다음 페이지를 가져오는 중인지 여부
    fetchNextPage: () => void;// 다음 페이지를 불러오는 실제 함수
    threshold?: number;// 대상이 얼마나 보여야 다음 페이지 불러올지 (0~1 사이)
    rootMargin?: string;// 대상을 감시하는 기준선 주변의 여백 (미리 불러오기용)
}

export const useInfiniteScroll = ({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    threshold = 0,// 기본값: 대상이 1픽셀이라도 보이면 실행
    rootMargin = '200px'// 기본값: 화면 바닥에 닿기 200px 전에 미리 감지 
}: UseIntersectionObserverProps) => {
    // 바닥의 HTML 가리키기
    const observerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 바닥 계속 감시 
        const observer = new IntersectionObserver(
            (entries) => {
                // isIntersecting: 화면에 등장했고
                // hasNextPage: 다음 페이지가 있고
                // isFetchingNextPage: 지금 로딩 중이 아닐 때만
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage(); // 다음 페이지 가져오기
                }
            },
            { threshold, rootMargin }
        );

        // 만약 감시할 대상(observerRef)이 존재한다면 감시 시작
        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        // 컴포넌트가 사라지거나 재실행될 때, 이전 관찰을 중단하여 메모리 누수 방지
        return () => observer.disconnect();
        
    }, [hasNextPage, isFetchingNextPage, fetchNextPage, threshold, rootMargin]);

    return observerRef;
};