import { useEffect, useState } from "react";
import { useUserPrivacyInfo } from "../hooks/useUserPrivacyInfo";
import { useForm } from "react-hook-form";
import { userPrivacyInfoSchema, type UserPrivacyFormValues } from "../schema/userPrivacyInfoSchema";
import { zodResolver } from "@hookform/resolvers/zod";

interface UserPrivacyInfoUpdateProps{
    isOpen: boolean;
    onClose: () => void;
}

// [프로필 개인정보 수정 모달]
export const UserPrivacyInfoUpdateModal = ({isOpen, onClose}: UserPrivacyInfoUpdateProps) => {

    const DEFAULT_PROFILE = `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image.png`;

    // [상태관리]
    // 1. 비밀번호 변경 토클 오픈 여부 관리
    const [ isPasswordChanging, setIsPasswordChanging ] = useState(false);

    // [훅 관리]
    // 1. 수정용 사용자 개인정보 가져오기 훅
    const { data: userPrivacy, isLoading, isError } = useUserPrivacyInfo(isOpen);

    // 2. 폼 초기화
    const { register, handleSubmit, setValue, formState: {errors}, reset} = useForm<UserPrivacyFormValues>({
        // zod 유효성 검사 폼 주입
        resolver: zodResolver(userPrivacyInfoSchema),
        // 기본값은 공백으로 셋팅 (비동기로 데이터 가져오는게 느리기 때문)
        defaultValues: {
            nickname: '',
            phoneNumber: '',
            isPasswordChanging: false,
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    // [초기값]
    // 1. 백엔드에서 데이터 가져오면 기존 개인정보 데이터를 폼에 주입 (이름, 이메일은 읽기 전용으로 return에서 주입)
    useEffect(() => {
        if(userPrivacy){
            setValue('nickname', userPrivacy.nickname);
            setValue('phoneNumber', userPrivacy.phoneNumber || '');
        }
    },[userPrivacy, setValue]);

    // 2. 비밀번호 토글 열리고 닫힐때마다 상태 변경
    useEffect(() => {
        setValue('isPasswordChanging', isPasswordChanging);
    },[isPasswordChanging, setValue]);

    // [핸들러]
    // 1. 모달 닫힐 때 폼 입력값 및 비밀번호 토클 입력값 초기화
    const handleModalClose = () => {
        reset();
        setIsPasswordChanging(false);
        onClose();
    }

    // 2. 프로필 수정 요청
    // 🚨프로필 개인정보 수정 시 작성🚨
    const onSubmit = (values: UserPrivacyFormValues) => {
        console.log('서버로 보낼 수정 최종 데이터: ', values);
    };

    // 모달이 닫혀있으면 아무것도 렌더링하지 않음
    if(!isOpen) return null;

    return(
        <dialog open onClick={handleModalClose}>
            <article onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '100%' }}>
                
                {/* 헤더 */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>개인정보 수정</strong>

                    {/* 모달 닫기 버튼 */}
                    <button 
                        type="button" 
                        className="secondary outline" 
                        onClick={handleModalClose} 
                        style={{ padding: '0.25rem 0.5rem', margin: 0, border: 'none' }}
                    >
                        &times;
                    </button>
                </header>

                {/* 로딩 및 에러 처리 */}
                {isLoading && <p aria-busy="true">기존 프로필 정보를 불러오는 중입니다...</p>}
                {isError && <p style={{ color: 'var(--pico-form-element-invalid-border-color)' }}>데이터를 불러오는 데 실패했습니다.</p>}

                {/* 본문 폼 영역 */}
                {!isLoading && userPrivacy && (
                <form onSubmit={handleSubmit(onSubmit)}>
                    
                    {/* 프로필 이미지 영역 🚨프로필 수정에서 이미지 업로드 구현🚨*/}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--pico-spacing)' }}>
                        <img 
                            src={userPrivacy.profileImageUrl || DEFAULT_PROFILE} 
                            alt="프로필 미리보기" 
                            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '0.5rem' }}
                        />
                        <a href="#/" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>프로필 이미지 바꾸기</a>
                    </div>

                    {/* 읽기 전용 필드들 (이름, 이메일) */}
                    <div className="grid">
                        <label>
                            이름
                            <input type="text" value={userPrivacy.name} readOnly disabled />
                        </label>
                        <label>
                            이메일
                            <input type="text" value={userPrivacy.email} readOnly disabled />
                        </label>
                    </div>

                    {/* 수정 가능 필드 (닉네임) */}
                    <label>
                        닉네임
                        <div className="grid" style={{ gridTemplateColumns: '1fr auto', gap: '0.5rem', alignItems: 'start' }}>
                            <input 
                                type="text" 
                                {...register('nickname')} 
                                placeholder="닉네임 입력"
                                aria-invalid={errors.nickname ? "true" : undefined}
                            />
                            {/* 🚨수정에서 중복확인 구현🚨 */}
                            <button type="button" className="secondary" style={{ whiteSpace: 'nowrap' }}>중복확인</button>
                        </div>
                        {errors.nickname && <small style={{ color: 'var(--pico-form-element-invalid-border-color)' }}>{errors.nickname.message}</small>}
                    </label>

                    {/* 수정 가능 필드 (전화번호) */}
                    <label>
                        전화번호
                        <input 
                            type="text" 
                            {...register('phoneNumber')} 
                            placeholder="01012345678 (숫자만 입력)"
                            aria-invalid={errors.phoneNumber ? "true" : undefined}
                        />
                        {errors.phoneNumber && <small style={{ color: 'var(--pico-form-element-invalid-border-color)' }}>{errors.phoneNumber.message}</small>}
                    </label>

                    <hr />

                    {/* 비밀번호 변경 토글 (소셜 유저가 아닐 때만 노출) */}
                    {!userPrivacy.isSocial ? (
                        <div style={{ marginBottom: 'var(--pico-spacing)' }}>
                            <button 
                                type="button" 
                                className="outline contrast"
                                style={{ width: '100%' }}
                                onClick={() => setIsPasswordChanging(!isPasswordChanging)}
                            >
                                {isPasswordChanging ? '🔒 비밀번호 변경 취소' : '🔒 비밀번호 변경하기'}
                            </button>

                            {/* 토글 오픈 영역 폼 */}
                            {isPasswordChanging && (
                                <fieldset style={{ marginTop: '1rem', padding: '1rem', border: '1px solid var(--pico-muted-border-color)', borderRadius: 'var(--pico-border-radius)' }}>
                                    <label>
                                        현재 비밀번호
                                        <input type="password" {...register('currentPassword')} placeholder="현재 비밀번호 입력" aria-invalid={errors.currentPassword ? "true" : undefined} />
                                        {errors.currentPassword && <small style={{ color: 'var(--pico-form-element-invalid-border-color)' }}>{errors.currentPassword.message}</small>}
                                    </label>
                                    <label>
                                        새 비밀번호
                                        <input type="password" {...register('newPassword')} placeholder="새 비밀번호 입력" aria-invalid={errors.newPassword ? "true" : undefined} />
                                        {errors.newPassword && <small style={{ color: 'var(--pico-form-element-invalid-border-color)' }}>{errors.newPassword.message}</small>}
                                    </label>
                                    <label>
                                        새 비밀번호 확인
                                        <input type="password" {...register('confirmPassword')} placeholder="새 비밀번호 확인 입력" aria-invalid={errors.confirmPassword ? "true" : undefined} />
                                        {errors.confirmPassword && <small style={{ color: 'var(--pico-form-element-invalid-border-color)' }}>{errors.confirmPassword.message}</small>}
                                    </label>
                                </fieldset>
                            )}
                        </div>
                    ) : (
                        <p style={{ fontSize: '0.85rem', color: 'var(--pico-muted-color)', textAlign: 'center', marginBottom: 'var(--pico-spacing)' }}>
                            소셜 로그인 계정은 비밀번호 변경이 불가능합니다.
                        </p>
                    )}

                    {/* 최종 제출 버튼 */}
                    <footer>
                        <button type="submit" style={{ width: '100%', margin: 0 }}>저장</button>
                    </footer>
                </form>
                )}
            </article>
        </dialog>
    );
};