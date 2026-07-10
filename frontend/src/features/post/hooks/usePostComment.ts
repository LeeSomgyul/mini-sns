import { useInfiniteQuery } from "@tanstack/react-query";
import { POST_KEYS } from "../../../constants/queryKey";
import { postCommentApi } from "../api/postCommentApi";

export const usePostComment = (postId: number | null) => {

    // [무한스크롤 훅]
    const {
        data,               // 서버에서 받아온 댓글 데이터
        fetchNextPage,      // 다음 페이지 데이터 가져오기 요청 함수
        hasNextPage,        // 다음 페이지 존재 여부
        isLoading,          // 맨 처음 0번째 페이지 가져올 때 로딩 여부
        isFetchingNextPage, // 다음페이지 가져오는 중 로딩 여부
        status              // 전체적인 쿼리 상태
    } = useInfiniteQuery({

        // 1. ['posts', postId, 'comments'] 키에 댓글 데이터 저장
        queryKey: POST_KEYS.comments(postId!),

        // 2. api 요청 
        // - pageParam: 몇번째 페이지 데이터 가져올지 전달
        queryFn: ({pageParam}) => {
            return postCommentApi.getPostComments(
                postId!,
                pageParam as number | null,
                10
            );
        },

        // 3. 처음 api 요청 시 0번째 페이지 요청
        initialPageParam: null as number | null,

        // 4. 다음 페이지 번호를 어떻게 구해야 하는지 방법
        getNextPageParam: (lastPage) => {
            return lastPage.hasNextPage ? lastPage.nextCursor : undefined;
        },
        enabled: postId !== null,
    });

    // [가져온 데이터를 1차원 배열로 만들기]
    const flattenedComments = data
        ? data.pages.flatMap((page) => page.content)
        : [];

    return {
        comments: flattenedComments,
        fetchNextPage, 
        hasNextPage,
        isLoading,
        isFetchingNextPage,
        status
    }
};