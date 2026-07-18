import type { AxiosError } from "axios";
import type { UnfollowRequest, UnfollowResponse } from "../types/FollowType";
import type { ErrorResponse } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followApi } from "../api/followApi";
import { FOLLOW_KEYS, PROFILE_KEYS } from "../../../constants/queryKey";
import { useAuthStore } from "../../auth/store/authStore";

interface UnfollowMutationProps{
    isModalOpen?: boolean;
    onSuccess?: (data: UnfollowResponse, variables: UnfollowRequest) => void;
    onError?: (error: AxiosError<ErrorResponse>) => void;
}

export const useUnfollowMutation = ({isModalOpen ,onSuccess, onError}: UnfollowMutationProps) => {
    const queryClient = useQueryClient();
    const myUserId = useAuthStore((state) => state.myUserId);

    return useMutation({
        // [api] 언팔로우 요청
        mutationFn: (request: UnfollowRequest) => followApi.unfollow(request),

        // [성공 시 실행]
        // - data: FollowResponse
        // - variables: mutationFn에서 사용한 FollowRequest
        onSuccess: (data, variables) => {
            const {targetUserId} = variables;
            console.log("현재 무효화하려는 targetUserId 값:", variables);

            // 캐시 무효화 (내 팔로잉 목록, 상대방 팔로워 목록, 상대방 프로필 카운트, 내 프로필 전체)
            setTimeout(() => {
                if (myUserId) {
                    if(!isModalOpen){
                        queryClient.invalidateQueries({ queryKey: FOLLOW_KEYS.followings(myUserId) });
                    }
                    queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.user(myUserId) });
                }

                if(!isModalOpen){
                    queryClient.invalidateQueries({ queryKey: FOLLOW_KEYS.followers(targetUserId) });
                }
                queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.user(targetUserId) });
            }, 100);

            // 컴포넌트에게 백엔드에서 전달받은 FollowResponse 전달
            if(onSuccess) onSuccess(data, variables);
        },

        // [실패 시 실행]
        onError: (error: AxiosError<ErrorResponse>) => {
            console.log('언팔로우 요청 실패: ', error);

            // 컴포넌트에게 백엔드에서 전달받은 에러메시지 전달
            if(onError) onError(error);
        },
    });
};