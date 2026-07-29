import { useEffect, useState } from "react";
import { useUserPrivacyInfo } from "../hooks/useUserPrivacyInfo";
import { FormProvider, useForm } from "react-hook-form";
import { userPrivacyInfoSchema, type UserPrivacyFormValues } from "../schema/userPrivacyInfoSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { NicknameCheckBtn } from "./NicknameCheckBtn";
import { ProfileImageUploader } from "./ProfileImageUploader";
import type { UserPrivacyInfoUpdateRequest } from "../types/UserPrivacyInfoType";
import { useUpdateUserPrivacy } from "../hooks/useUpdateUserPrivacy";
import toast from "react-hot-toast";
import axios from "axios";
import type { ErrorResponse } from "../../../common/types/commonType";
import { useAuthStore } from "../../auth/store/authStore";

interface UserPrivacyInfoUpdateProps{
    isOpen: boolean;
    onClose: () => void;
}

// [프로필 개인정보 수정 모달]
export const UserPrivacyInfoUpdateModal = ({isOpen, onClose}: UserPrivacyInfoUpdateProps) => {

    // [상태관리]
    // 1. 비밀번호 변경 토클 오픈 여부 관리
    const [ isPasswordChanging, setIsPasswordChanging ] = useState(false);

    // 2. 미니오 objectKey 저장
    const [finalProfileKey, setFinalProfileKey] = useState<string | null>(null);

    // 3. 전역 상태
    const logout = useAuthStore((state) => state.logout);

    // [훅 관리]
    // 1. 수정용 사용자 개인정보 가져오기 훅
    const { data: userPrivacy, isLoading, isError } = useUserPrivacyInfo(isOpen);

    // 2. 프로필 수정 최종 전송 훅
    const { mutate: updatePrivacy, isPending } = useUpdateUserPrivacy();

    // 3. 폼 초기화
    const methods = useForm<UserPrivacyFormValues>({
        // zod 유효성 검사 폼 주입
        resolver: zodResolver(userPrivacyInfoSchema),
        // 초기값은 공백으로 셋팅 (비동기로 데이터 가져오는게 느리기 때문)
        defaultValues: {
            nickname: '',
            isNicknameChecked: false,
            phoneNumber: '',
            isPasswordChanging: false,
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
        // 서버에서 비동기로 데이터 가져온 이후 값 채워넣기
        values: {
            nickname: userPrivacy?.nickname || '',
            isNicknameChecked: true,
            phoneNumber: userPrivacy?.phoneNumber || '',
            isPasswordChanging: false,
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        }
    });
    
    const { register, handleSubmit, setValue, formState: {errors}, reset } = methods;


    // [초기] 비밀번호 토글 열리고 닫힐때마다 상태 변경
    useEffect(() => {
        setValue('isPasswordChanging', isPasswordChanging);

        // 사용자가 비밀번호 입력하다가 토글을 닫은 경우 RHF 값을 모두 공백으로 초기화
        if(!isPasswordChanging){
            setValue('currentPassword', '');
            setValue('newPassword', '');
            setValue('confirmPassword', '');
        }
    },[isPasswordChanging, setValue]);

    // [핸들러]
    // 1. 모달 닫힐 때 폼 입력값 및 비밀번호 토클 입력값 초기화
    const handleModalClose = () => {
        reset();
        setIsPasswordChanging(false);
        setFinalProfileKey(null);
        onClose();
    }

    // 2. 프로필 수정 완료 요청
    const onSubmit = (values: UserPrivacyFormValues) => {
        // 백엔드에 넣기 위한 완료 값 조립
        const finalSubmitData: UserPrivacyInfoUpdateRequest = {
            nickname: values.nickname,
            phoneNumber: values.phoneNumber,
            profileImageUrl: finalProfileKey,
            isPasswordChanging: values.isPasswordChanging,

            // 비밀번호 입력 토클이 열려있을 때만 비밀번호 데이터를 추가
            currentPassword: values.isPasswordChanging ? (values.currentPassword || '') : '',
            newPassword: values.isPasswordChanging ? (values.newPassword || '') : '', 
        };

        updatePrivacy(finalSubmitData, {
            onSuccess: () => {
                if(finalSubmitData.isPasswordChanging){
                    toast.success("비밀번호가 변경되어 보안을 위해 자동 로그아웃됩니다.\n다시 로그인해주세요.");
                    logout();
                }
                
                handleModalClose();
            },
            onError: (error: unknown) => {
                // 백엔드에서 응답하는 에러가 존재한다면 그거 사용
                if(axios.isAxiosError<ErrorResponse>(error)){
                    const errorMessage = error.response?.data.message ?? "개인정보 수정에 실패했습니다.";

                    methods.setError("currentPassword", {
                        type: "server",
                        message: errorMessage
                    });

                    return;
                }
            }
        });
    };

    // 모달이 닫혀있으면 아무것도 렌더링하지 않음
    if(!isOpen) return null;

    const textInputClass = "h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-800 outline-none focus:border-[#5cc8f1] transition-colors placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-400";
    const labelClass = "mb-1.5 block text-sm font-semibold text-[#2b2b31]";
    const fieldErrorClass = "mt-1 block text-xs text-red-500";

    return(
        <dialog
            open
            onClick={handleModalClose}
            className="fixed inset-0 z-[999] m-0 flex h-full w-full max-h-none max-w-none items-center justify-center bg-black/40 backdrop-blur-sm p-0"
        >
            <article
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[500px] max-h-[85vh] overflow-y-auto rounded-3xl border border-white/60 bg-white/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-6"
            >

                {/* 헤더 */}
                <header className="flex items-center justify-between mb-5">
                    <strong className="text-lg font-semibold text-[#2b2b31]">개인정보 수정</strong>

                    {/* 모달 닫기 버튼 */}
                    <button
                        type="button"
                        onClick={handleModalClose}
                        className="flex items-center justify-center w-8 h-8 rounded-[10px] hover:bg-black/10 cursor-pointer transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 text-[#2b2b31]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                {/* 로딩 및 에러 처리 */}
                {isLoading && <p aria-busy="true" className="text-center text-sm text-[#8b8b92] py-8">기존 프로필 정보를 불러오는 중입니다...</p>}
                {isError && <p className="text-center text-sm text-red-500 py-8">데이터를 불러오는 데 실패했습니다.</p>}

                {/* 본문 폼 영역 */}
                {!isLoading && userPrivacy && (
                    <FormProvider {...methods}>
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                            {/* 프로필 이미지 영역*/}
                            <ProfileImageUploader
                                currentProfileImageUrl={userPrivacy.profileImageUrl}
                                onProfileKeyChange={(key) => setFinalProfileKey(key)}
                            />

                            {/* 읽기 전용 필드들 (이름, 이메일) */}
                            <div className="grid grid-cols-2 gap-3">
                                <label className="block">
                                    <span className={labelClass}>이름</span>
                                    <input type="text" value={userPrivacy.name} readOnly disabled className={textInputClass} />
                                </label>
                                <label className="block">
                                    <span className={labelClass}>이메일</span>
                                    <input type="text" value={userPrivacy.email} readOnly disabled className={textInputClass} />
                                </label>
                            </div>

                            {/* 수정 가능 필드 (닉네임) */}
                            <NicknameCheckBtn/>

                            {/* 수정 가능 필드 (전화번호) */}
                            <label className="block">
                                <span className={labelClass}>전화번호</span>
                                <input
                                    type="text"
                                    {...register('phoneNumber')}
                                    placeholder="01012345678 (숫자만 입력)"
                                    aria-invalid={errors.phoneNumber ? "true" : undefined}
                                    className={textInputClass}
                                />
                                {errors.phoneNumber && <span className={fieldErrorClass}>{errors.phoneNumber.message}</span>}
                            </label>

                            <hr className="border-black/5 my-1" />

                            {/* 비밀번호 변경 토글 (소셜 유저가 아닐 때만 노출) */}
                            {!userPrivacy.isSocial ? (
                                <div>
                                    <button
                                        type="button"
                                        className="w-full h-11 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => setIsPasswordChanging(!isPasswordChanging)}
                                    >
                                        {isPasswordChanging ? '비밀번호 변경 취소' : '비밀번호 변경하기'}
                                    </button>

                                    {/* 토글 오픈 영역 폼 */}
                                    {isPasswordChanging && (
                                        <fieldset className="mt-4 flex flex-col gap-3 p-4 rounded-2xl border border-gray-100 bg-gray-50/60">
                                            <label className="block">
                                                <span className={labelClass}>현재 비밀번호</span>
                                                <input type="password" {...register('currentPassword')} placeholder="현재 비밀번호 입력" aria-invalid={errors.currentPassword ? "true" : undefined} className={textInputClass} />
                                                {errors.currentPassword && <span className={fieldErrorClass}>{errors.currentPassword.message}</span>}
                                            </label>
                                            <label className="block">
                                                <span className={labelClass}>새 비밀번호</span>
                                                <input type="password" {...register('newPassword')} placeholder="새 비밀번호 입력" aria-invalid={errors.newPassword ? "true" : undefined} className={textInputClass} />
                                                {errors.newPassword && <span className={fieldErrorClass}>{errors.newPassword.message}</span>}
                                            </label>
                                            <label className="block">
                                                <span className={labelClass}>새 비밀번호 확인</span>
                                                <input type="password" {...register('confirmPassword')} placeholder="새 비밀번호 확인 입력" aria-invalid={errors.confirmPassword ? "true" : undefined} className={textInputClass} />
                                                {errors.confirmPassword && <span className={fieldErrorClass}>{errors.confirmPassword.message}</span>}
                                            </label>
                                        </fieldset>
                                    )}
                                </div>
                            ) : (
                                <p className="text-center text-xs text-[#a7a7ae]">
                                    소셜 로그인 계정은 비밀번호 변경이 불가능합니다.
                                </p>
                            )}

                            {/* 최종 제출 버튼 */}
                            <button
                                type="submit"
                                disabled={isPending}
                                className="h-11 w-full rounded-xl bg-black text-white text-sm font-semibold cursor-pointer hover:bg-black/85 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                저장
                            </button>
                        </form>
                    </FormProvider>
                )}
            </article>
        </dialog>
    );
};