import type { AxiosError } from "axios";
import type { UnfollowRequest, UnfollowResponse } from "../types/FollowType";
import type { ErrorResponse } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followApi } from "../api/followApi";
import { FOLLOW_KEYS, PROFILE_KEYS } from "../../../constants/queryKey";

interface UnfollowMutationProps{
    onSuccess?: (data: UnfollowResponse) => void;
    onError?: (error: AxiosError<ErrorResponse>) => void;
}

export const useUnfollowMutation = ({onSuccess, onError}: UnfollowMutationProps) => {
    const queryClient = useQueryClient();

    return useMutation({
        // [api] 언팔로우 요청
        mutationFn: (request: UnfollowRequest) => followApi.unfollow(request),

        // [성공 시 실행]
        // - data: FollowResponse
        // - variables: mutationFn에서 사용한 FollowRequest
        onSuccess: (data, variables) => {
            const {targetUserId} = variables;

            // 캐시 무효화 (내 팔로잉 목록, 상대방 프로필, 내 프로필 전체)
            queryClient.invalidateQueries({queryKey: FOLLOW_KEYS.followingsAll()});
            queryClient.invalidateQueries({queryKey: PROFILE_KEYS.user(targetUserId)});
            queryClient.invalidateQueries({queryKey: PROFILE_KEYS.users()});

            // 컴포넌트에게 백엔드에서 전달받은 FollowResponse 전달
            if(onSuccess) onSuccess(data);
        },

        // [실패 시 실행]
        onError: (error: AxiosError<ErrorResponse>) => {
            console.log('언팔로우 요청 실패: ', error);

            // 컴포넌트에게 백엔드에서 전달받은 에러메시지 전달
            if(onError) onError(error);
        },
    });
};