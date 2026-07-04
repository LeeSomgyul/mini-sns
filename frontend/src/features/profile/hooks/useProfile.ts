import { useQuery } from "@tanstack/react-query"
import { PROFILE_KEYS } from "../../../constants/queryKey";
import { profileApi } from "../api/profileApi";

export const useProfile = (userId: number) => {
    // 1. 유저 프로필 기본 정보
    const userQuery = useQuery({
        queryKey: PROFILE_KEYS.user(userId),
        queryFn: () => profileApi.getUserProfile(userId),
        staleTime: 1000 * 60 * 5,
    });

    // 2. 유저 프로필 게시물 정보
    const postQuery = useQuery({
       queryKey: PROFILE_KEYS.post(userId),
       queryFn: () => profileApi.getPostUserProfile(userId),
       staleTime: 1000 * 60 * 5,
    });

    // 두 API 중 하나라도 로딩 중이면 전체 로딩 상태로 취급
    const isLoading = userQuery.isLoading || postQuery.isLoading;
    const isError = userQuery.isError || postQuery.isError;

    return{
        userData: userQuery.data,
        postData: postQuery.data,
        isLoading,
        isError,
    };
};