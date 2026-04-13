export interface SettingsModalProps{
    closeModal: () => void;
}

//설정탭 종류: 로그아웃, 회원탈퇴
export type SettingsTabType = 'logout' | 'withdraw';