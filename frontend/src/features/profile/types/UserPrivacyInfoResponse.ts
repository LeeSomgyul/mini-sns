export interface UserPrivacyInfoResponse{
    name: string;
    nickname: string;
    phoneNumber: string;
    profileImageUrl: string | null;
    email: string;
    isSocial: boolean;
}

// 개인정보 변경 닉네임 중복체크
export interface ProfileNicknameCheck {
    exists: boolean;
}