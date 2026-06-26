import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FEED_KEYS } from "../../../constants/queryKey";
import type { FeedResponse } from "../../feed/types/feedResponseType";
import { postApi } from "../api/postApi";

interface UsePostLikeProps{
    postId: number;
    isCurrentlyLiked: boolean;
}

export const usePostLikeMutation = () => {
    
    const queryClient = useQueryClient();
    
    return useMutation({
        // 1. api 요청 전에 낙관적 업데이트 먼저 실행
        onMutate: async({postId, isCurrentlyLiked}: UsePostLikeProps) => {
            // 좋아요 요청이 있다면 피드 목록 불러오던 요청 멈추기(충돌 날 수도 있기 때문)
            await queryClient.cancelQueries({queryKey: FEED_KEYS.lists()});

            // 기존 캐시 데이터 가져오기
            const previousFeed = queryClient.getQueryData<FeedResponse>(FEED_KEYS.lists());

            // 캐시 데이터 수동 업데이트
            queryClient.setQueryData<FeedResponse>(FEED_KEYS.lists(), (oldData) => 
                updateFeedCache(oldData, postId, isCurrentlyLiked)
            );

            return {previousFeed};
        },

        // 2. 좋아요 등록 및 취소 api 요청
        // - postApi에서 Promise로 이미 비동기 설정을 해놓았기 때문에 async 필요 없음
        mutationFn: ({postId, isCurrentlyLiked}: UsePostLikeProps) => {
            return postApi.toggleLike(postId, isCurrentlyLiked);            
        },

        // 3. 서버에 좋아요 저장 실패 시 이전 캐시 데이터로 복구
        // - 낙관적 업데이트 하기 전의 캐시 데이터 가져와서 적용하기
        onError: (_err, _variables, context) => {
            if(context?.previousFeed){
                queryClient.setQueryData(FEED_KEYS.lists(), context.previousFeed);
            }
        }
    });
};


//================================
//   캐시 데이터 업데이트 메서드
//================================
const updateFeedCache = (
    oldData: FeedResponse | undefined,
    postId: number,
    isCurrentlyLiked: boolean
): FeedResponse | undefined => {
    
    // 1. 업데이트 된 내용이 없다면 기존 데이터 그대로 리턴
    if(!oldData?.posts) return oldData;

    // 2. 업데이트 된 내용 있다면 캐시 업데이트
    const updateList = oldData.posts.map((post) => {
        if(post.postId !== postId) return post;

        return{
            ...post,
            isLiked: !isCurrentlyLiked,
            likeCount: isCurrentlyLiked 
                ? Math.max(0, post.likeCount - 1)
                : post.likeCount + 1
        };
    })

    return {...oldData, posts: updateList}
}