import { useQuery } from "@tanstack/react-query";
import { USER_KEYS } from "../../../constants/queryKey";
import { userPrivacyInfoApi } from "../api/userPrivacyInfoApi";

// @param isOpen 개인정보 수정 모달 열림 여부
export const useUserPrivacyInfo = (isOpen: boolean) => {
    return useQuery({
        queryKey: USER_KEYS.me(),
        queryFn: userPrivacyInfoApi.getUserPrivacyInfo,
        enabled: isOpen,
        staleTime: 1000 * 60 * 2,
        refetchOnWindowFocus: false,
    });
};