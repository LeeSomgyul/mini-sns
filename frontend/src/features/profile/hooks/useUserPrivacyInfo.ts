import { useQuery } from "@tanstack/react-query";
import { USER_KEYS } from "../../../constants/queryKey";
import { userPrivacyInfoApi } from "../api/userPrivacyInfoApi";
import { useAuthStore } from "../../auth/store/authStore";
import { useEffect } from "react";

// [개인정보 조회]
// @param isOpen 개인정보 수정 모달 열림 여부
export const useUserPrivacyInfo = (isOpen: boolean) => {
    const setMyNickname = useAuthStore((state) => state.setMyNickname);
    const setMyProfileImageUrl = useAuthStore((state) => state.setMyProfileImageUrl);

    const queryProperty = useQuery({
        queryKey: USER_KEYS.me(),
        queryFn: userPrivacyInfoApi.getUserPrivacyInfo,
        enabled: isOpen,
        staleTime: 1000 * 60 * 2,
        refetchOnWindowFocus: false,
    });

    // 개인정보 수정 완료 후 전역 개인정보 상태 업데이트
    useEffect(() => {
        if(queryProperty.data){
            setMyNickname(queryProperty.data.nickname);
            setMyProfileImageUrl(queryProperty.data.profileImageUrl);
        }
    }, [queryProperty.data, setMyNickname, setMyProfileImageUrl])

    return queryProperty;
};