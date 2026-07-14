import { useProfileImageManager } from "../hooks/useProfileImageManager";
import { useState, useEffect, useRef } from "react";
import type { SelectedProfileImageType } from "../types/SelectedProfileImageType";

interface ProfileImageUploaderProps {
    currentProfileImageUrl: string | null;
    onProfileKeyChange: (key: string | null) => void;
}

export const ProfileImageUploader = ({currentProfileImageUrl, onProfileKeyChange}: ProfileImageUploaderProps) => {

    const DEFAULT_PROFILE = `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image.png`;

    const [profileState, setUploadState] = useState<SelectedProfileImageType | null>(null);

    // [훅] uppy 훅
    const { uppy } = useProfileImageManager({ setUploadState });

    // [변수] 화면에 보여줄 실제 이미지 url 결정
    // - 새로 업로드한 내역이 있다면 해당 이미지 보여주고, 없다면 기존 이미지 보여주기
    const displayImageUrl = profileState?.previewUrl || currentProfileImageUrl || DEFAULT_PROFILE;

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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--pico-spacing)' }}>
            
            {/* 프로필 이미지 미리보기 영역 */}
            <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '0.5rem' }}>
                <img 
                    src={displayImageUrl} 
                    alt="프로필 미리보기" 
                    style={{ 
                        width: '100%', 
                        height: '100%', 
                        borderRadius: '50%', 
                        objectFit: 'cover',
                        opacity: currentStatus === 'UPLOADING' ? 0.5 : 1,
                        transition: 'opacity 0.2s ease'
                    }}
                />

                {/* 업로드 중일 때 이미지 한가운데에 로딩중 뱅글이 띄우기 */}
                {currentStatus === 'UPLOADING' && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '1.2rem'
                    }} aria-busy="true" />
                )}
            </div>

            {/* 업로드 버튼 연결 */}
            <button
                type="button"
                className="outline secondary" // Pico.css 기본 테두리 버튼 스타일
                style={{ 
                    padding: '0.35rem 0.75rem', 
                    fontSize: '0.85rem', 
                    margin: 0,
                    width: 'auto'
                }}
                onClick={handleButtonClick}
                disabled={currentStatus === 'UPLOADING'}
            >
                프로필 이미지 바꾸기
            </button>

            <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleProfileFileChange} 
            />

            {/* 에러 발생 시 안내 문구 */}
            {currentStatus === 'ERROR' && (
                <small style={{ color: 'var(--pico-form-element-invalid-border-color)', marginTop: '0.25rem' }}>
                    이미지 업로드에 실패했습니다. 다시 시도해 주세요.
                </small>
            )}
        </div>
    );
};