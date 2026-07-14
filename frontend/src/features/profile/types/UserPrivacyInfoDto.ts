// 프로필 개인정보 리스트 조회
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

// 프로필 개인정보 수정
export interface UserPrivacyInfoUpdateRequest{
    nickname: string;
    phoneNumber: string;
    profileImageUrl: string | null;
    isPasswordChanging: boolean;
    currentPassword: string;
    newPassword: string;
}