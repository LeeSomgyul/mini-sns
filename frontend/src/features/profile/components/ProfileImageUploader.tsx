import { useProfileImageManager } from "../hooks/useProfileImageManager";
import { useState, useEffect, useRef } from "react";
import type { SelectedProfileImageType } from "../types/SelectedProfileImageType";
import { getProfileImageUrl } from "../../../common/utils/randomProfileImage";
import { useAuthStore } from "../../auth/store/authStore";

interface ProfileImageUploaderProps {
    currentProfileImageUrl: string | null;
    onProfileKeyChange: (key: string | null) => void;
}

export const ProfileImageUploader = ({currentProfileImageUrl, onProfileKeyChange}: ProfileImageUploaderProps) => {

    const myUserId = useAuthStore((state) => state.myUserId);
    const [profileState, setUploadState] = useState<SelectedProfileImageType | null>(null);

    // [훅] uppy 훅
    const { uppy } = useProfileImageManager({ setUploadState });

    // [변수] 화면에 보여줄 실제 이미지 url 결정
    // - 새로 업로드한 내역이 있다면 해당 이미지 보여주고, 없다면 기존 이미지 보여주기
    const profileImage = getProfileImageUrl({
        profileImageUrl: currentProfileImageUrl,
        userId: myUserId,
    });

    const displayImageUrl = profileState?.previewUrl || profileImage;

    // [변수] 업로드 진행 상태
    const currentStatus = profileState ? profileState.status : 'IDLE';

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = () => {
        if (currentStatus === 'UPLOADING') return; // 업로드 중엔 작동 금지 가드
        fileInputRef.current?.click();
    };

    // [핸들러] 이미지 업로드 클릭 시 파일업로드 열기
    const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            uppy.cancelAll();
            uppy.addFile({
                source: "local",
                name: file.name,
                type: file.type,
                data: file,
            });
        }
    };

    useEffect(() => {
        if (profileState?.status === 'SUCCESS' && profileState.originalKey) {
            onProfileKeyChange(profileState.originalKey);
        }
    }, [profileState?.status, profileState?.originalKey, onProfileKeyChange]);


    return(
        <div className="flex flex-col items-center gap-2 mb-2">

            {/* 프로필 이미지 미리보기 영역 */}
            <div className="relative w-20 h-20 ">
                <img
                    src={displayImageUrl}
                    alt="프로필 미리보기"
                    className={`w-full h-full rounded-full object-cover transition-opacity border border-black/10 ${currentStatus === 'UPLOADING' ? 'opacity-50' : 'opacity-100'}`}
                />

                {/* 업로드 중일 때 이미지 한가운데에 로딩중 표시 띄우기 */}
                {currentStatus === 'UPLOADING' && (
                    <div aria-busy="true" className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
                        <span className="text-[10px] font-medium text-white">업로드 중</span>
                    </div>
                )}
            </div>

            {/* 업로드 버튼 연결 */}
            <button
                type="button"
                className="h-8 px-3 rounded-lg bg-black hover:bg-[#262626] border border-gray-200 text-xs font-normal text-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleButtonClick}
                disabled={currentStatus === 'UPLOADING'}
            >
                프로필 이미지 바꾸기
            </button>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileFileChange}
            />

            {/* 에러 발생 시 안내 문구 */}
            {currentStatus === 'ERROR' && (
                <span className="mt-1 text-xs text-red-500">
                    이미지 업로드에 실패했습니다. 다시 시도해 주세요.
                </span>
            )}
        </div>
    );
};