import { useQuery } from "@tanstack/react-query";
import { FEED_KEYS } from "../../../constants/queryKey";
import { feedApi } from "../api/feedApi";

// 프로필의 게시물 단건 조회
export const useFeedDetail = (postId: number | null) => {
    return useQuery({
        queryKey: FEED_KEYS.detail(postId),
        queryFn: () => feedApi.getFeedDetail(postId as number),
        enabled: !!postId,
        staleTime: 1000 * 60 * 5,
    });
};