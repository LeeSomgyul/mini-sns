import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { ErrorResponse } from "react-router-dom";
import type { FollowRequest, FollowResponse } from "../types/FollowType";
import { followApi } from "../api/followApi";
import { FOLLOW_KEYS, PROFILE_KEYS } from "../../../constants/queryKey";

interface FollowMutationProps{
    onSuccess?: (data: FollowResponse) => void;
    onError?: (error: AxiosError<ErrorResponse>) => void;
}

export const useFollowMutation = ({onSuccess, onError}: FollowMutationProps) => {
    const queryClient = useQueryClient();

    return useMutation({
        // [api] 팔로우 요청 
        mutationFn: (request: FollowRequest) => followApi.follow(request),

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
            console.log('팔로우 요청 실패: ', error);

            // 컴포넌트에게 백엔드에서 전달받은 에러메시지 전달
            if(onError) onError(error);
        },
    });
};