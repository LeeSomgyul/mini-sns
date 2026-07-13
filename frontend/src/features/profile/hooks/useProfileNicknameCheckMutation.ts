import { useMutation } from "@tanstack/react-query";
import { userPrivacyInfoApi } from "../api/userPrivacyInfoApi";


// [개인정보 변경 닉네임 중복체크]
export const useProfileNicknameCheckMutation = () => {
    return useMutation({
        mutationFn: (nickname: string) => userPrivacyInfoApi.checkNickName(nickname),
    });
}