import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { PROFILE_KEYS } from "../../../constants/queryKey";
import { profileApi } from "../api/profileApi";

export const useProfile = (userId: number) => {
    // 1. 유저 프로필 기본 정보
    const userQuery = useQuery({
        queryKey: PROFILE_KEYS.user(userId),
        queryFn: () => profileApi.getUserProfile(userId),
        staleTime: 1000 * 60 * 5,
    });

    // 2-1. 유저 프로필 게시물 정보 (그리들 썸네일 무한스크롤)
    const postInfiniteQuery = useInfiniteQuery({
        queryKey: PROFILE_KEYS.post(userId),
        queryFn: ({pageParam}) => profileApi.getPostUserProfile(userId, pageParam as number, 12),
        initialPageParam: 0, // 시작 페이지는 0으로 고정
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.hasNextPage ? allPages.length : undefined;
        },
        staleTime: 1000 * 60 * 5,
        // 영상 워커가 썸네일을 아직 못 만든 항목(thumbnailUrl이 ".../null")이 있으면
        // 3초마다 자동 refetch, 전부 채워지면 자동 정지
        refetchInterval: (query) => {
            const pages = query.state.data?.pages;
            if(!pages) return false;

            const hasPendingThumbnail = pages.some((page) =>
                page.thumbnails.some((thumb) => thumb.thumbnailUrl?.endsWith('/null'))
            );

            return hasPendingThumbnail ? 3000 : false;
        },
    });

    // 2-2. 배열 형식의 무한스크롤 page를 1차원 형식으로 변경
    // 예: [[1,2,3], [4,5,6]] 형식을 [1,2,3,4,5,6] 형식으로 변경
    const flattenedPostData = postInfiniteQuery.data
        ?   {
                postCount: postInfiniteQuery.data.pages[0]?.postCount || 0,
                thumbnails: postInfiniteQuery.data.pages.flatMap((page) => page.thumbnails),
            }
        : undefined;

    // 두 API 중 하나라도 로딩 중이면 전체 로딩 상태로 취급
    const isLoading = userQuery.isLoading || postInfiniteQuery.isLoading;
    const isError = userQuery.isError || postInfiniteQuery.isError;

    return{
        userData: userQuery.data,
        postData: flattenedPostData,
        fetchNextPage: postInfiniteQuery.fetchNextPage,
        hasNextPage: postInfiniteQuery.hasNextPage,
        isFetchingNextPage: postInfiniteQuery.isFetchingNextPage,
        isLoading,
        isError,
    };
};