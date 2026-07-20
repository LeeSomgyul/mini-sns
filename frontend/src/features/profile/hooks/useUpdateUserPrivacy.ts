import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserPrivacyInfoUpdateRequest } from "../types/UserPrivacyInfoType";
import { userPrivacyInfoApi } from "../api/userPrivacyInfoApi";
import { FEED_KEYS, POST_KEYS, PROFILE_KEYS, USER_KEYS } from "../../../constants/queryKey";

export const useUpdateUserPrivacy = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: UserPrivacyInfoUpdateRequest) => userPrivacyInfoApi.updateUserPrivacyInfo(request),
        onSuccess: () => {
            // 관련 queryKey 업데이트 (사용자, 피드, 게시물상세, 댓글, 전역)
            queryClient.invalidateQueries({queryKey: USER_KEYS.all, refetchType: 'all'});
            queryClient.invalidateQueries({queryKey: FEED_KEYS.all, refetchType: 'all'});
            queryClient.invalidateQueries({queryKey: POST_KEYS.all, refetchType: 'all'});
            queryClient.invalidateQueries({queryKey: PROFILE_KEYS.all, refetchType: 'all'});

        },
        onError: (error) => {
            console.log("개인정보 수정 실패: ", error);
        }
    });
};