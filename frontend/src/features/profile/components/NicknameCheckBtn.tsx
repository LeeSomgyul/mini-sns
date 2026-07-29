import { useFormContext } from "react-hook-form";
import type { UserPrivacyFormValues } from "../schema/userPrivacyInfoSchema";
import { useEffect, useState } from "react";
import { useProfileNicknameCheckMutation } from "../hooks/useProfileNicknameCheckMutation";

export const NicknameCheckBtn = () => {

    // 부모(UserPrivacyInfoUpdateModal)에게서 useForm 가져와서 사용
    const {
        register,
        watch,
        setError,
        clearErrors,
        getValues,
        setValue,
        trigger,
        formState: {errors}
    } = useFormContext<UserPrivacyFormValues>();

    const currentNickname = watch('nickname') || '';
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [localErrorMessage, setLocalErrorMessage] = useState<string>('');
    const [, setInputValue] = useState<string>('');
    const { mutateAsync: checkNickname, isPending} = useProfileNicknameCheckMutation();

    // 유저가 닉네임 중복체크 후 사용가능 받아놓고서, 다시 수정한 경우 성공 상태 초기화
    useEffect(() => {
        setSuccessMessage('');
    },[currentNickname]);

    // [메서드] 닉네임 중복검사 확인
    const handleNicknameDuplicate = async() => {
        const latestNickname = getValues('nickname');
        if(!latestNickname || latestNickname.trim() === '') return;

        setLocalErrorMessage('');
        setSuccessMessage('');
        setValue('isNicknameChecked', false);
        clearErrors('isNicknameChecked');

        const isFormatValid = await trigger('nickname');

        if(!isFormatValid) {
            setLocalErrorMessage('닉네임은 한글, 영문, 숫자만 가능합니다. (자음/모음 단독 입력 불가)');
            return;
        }

        try{
            const result = await checkNickname(latestNickname);
            const isExists = result.exists;

            // 중복체크 백엔드 결과
            if(isExists){
                setSuccessMessage('');
                setLocalErrorMessage('이미 사용 중인 닉네임입니다.');
                setError('nickname', {type: 'duplicate', message: '이미 사용 중인 닉네임입니다.'});
                setValue('isNicknameChecked', false);
            }else{
                setLocalErrorMessage('');
                clearErrors('nickname');
                setSuccessMessage('사용 가능한 닉네임입니다.');
                setValue('isNicknameChecked', true, {shouldValidate: true});
            }
        }catch(error){
            setSuccessMessage('');
            setError('nickname', {type: 'server', message: '닉네임 중복 체크 중 오류가 발생했습니다.'});
            setValue('isNicknameChecked', false);
        }
    };

    return (
        <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-[#2b2b31]">닉네임</span>
            <div className="grid grid-cols-[1fr_auto] gap-2 items-start">
                <input
                    type="text"
                    placeholder="닉네임 입력"
                    maxLength={10}
                    aria-invalid={errors.nickname ? "true" : successMessage ? "false" : undefined}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-800 outline-none focus:border-[#5cc8f1] transition-colors placeholder:text-gray-400"
                    {...register('nickname', {
                        onChange: (e) => {
                            // 1. 글자가 1글자라도 바뀌면 성공 메시지 & 기존 에러 초기화
                            setValue('isNicknameChecked', false);
                            setInputValue(e.target.value);
                            setSuccessMessage('');
                            setLocalErrorMessage('');
                            clearErrors('nickname');

                            // 2. 한글 11자 초과 확인
                            if (e.target.value.length > 10) {
                                e.target.value = e.target.value.slice(0, 10);
                                setInputValue(e.target.value);
                            }
                        }
                    })}
                    onKeyDown={(e) => {
                        // 엔터키 입력 미허용
                        if (e.key === 'Enter') {
                            e.preventDefault();
                        }
                    }}
                />
                <button
                    type="button"
                    className="h-11 shrink-0 whitespace-nowrap rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleNicknameDuplicate}
                    disabled={!currentNickname.trim()}
                >
                    {isPending ? '확인 중...' : '중복확인'}
                </button>
            </div>

            {/* 에러메시지 출력 공간 */}
            {(errors.nickname?.message || localErrorMessage) && (
                <span className="mt-1 block text-xs text-red-500">
                    {errors.nickname?.message || localErrorMessage}
                </span>
            )}

            {/* 성공메시지 출력 공간 */}
            {(!errors.nickname && !localErrorMessage) && successMessage && (
                <span className="mt-1 block text-xs text-emerald-600">
                    {successMessage}
                </span>
            )}
        </label>
    );
};