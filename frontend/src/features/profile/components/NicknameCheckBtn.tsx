import { useFormContext } from "react-hook-form";
import type { UserPrivacyFormValues } from "../schema/userPrivacyInfoSchema";
import { useEffect, useState } from "react";
import { useProfileNicknameCheckMutation } from "../hooks/useProfileNicknameCheckMutation";

export const NicknameCheckBtn = () => {

    // 부모(UserPrivacyInfoUpdateModal)에게서 useForm 가져와서 사용
    const {register, watch, setError, clearErrors, getValues, formState: {errors}} = useFormContext<UserPrivacyFormValues>();

    const currentNickname = watch('nickname') || '';
    const [successMessage, setSuccessMessage] = useState<string>('');
    const { mutateAsync: checkNickname, isPending} = useProfileNicknameCheckMutation();

    // 유저가 닉네임 중복체크 후 사용가능 받아놓고서, 다시 수정한 경우 성공 상태 초기화
    useEffect(() => {
        setSuccessMessage('');
    },[currentNickname]);

    // [메서드] 닉네임 중복검사 확인
    const handleNicknameDuplicate = async() => {
        const latestNickname = getValues('nickname');
        if(!latestNickname || errors.nickname) return;

        try{
            const result = await checkNickname(latestNickname);
            const isExists = result.exists;

            // 중복체크 백엔드 결과
            if(isExists){
                setSuccessMessage('');
                setError('nickname', {type: 'validate', message: '이미 사용 중인 닉네임입니다.'});
            }else{
                clearErrors('nickname');
                setSuccessMessage('사용 가능한 닉네임입니다.');
            }
        }catch(error){
            setSuccessMessage('');
            setError('nickname', {type: 'server', message: '닉네임 중복 체크 중 오류가 발생했습니다.'});
        }
    };

    return (
        <label>
            닉네임
            <div className="grid" style={{ gridTemplateColumns: '1fr auto', gap: '0.5rem', alignItems: 'start' }}>
                <input 
                    type="text" 
                    placeholder="닉네임 입력"
                    maxLength={10}
                    aria-invalid={errors.nickname ? "true" : successMessage ? "false" : undefined}
                    {...register('nickname', { 
                        onChange: (e) => {
                            // 1. 한글 11자 초과 컷팅 로직
                            if (e.target.value.length > 10) {
                                e.target.value = e.target.value.slice(0, 10);
                            }
                            
                            // 2. 글자가 1글자라도 바뀌면 성공 메시지 & 기존 에러 초기화 (버튼 먹통 방어)
                            setSuccessMessage('');
                            if (errors.nickname?.type === 'manual') {
                                clearErrors('nickname');
                            }
                            
                            // 💡 이 함수가 끝나면 RHF가 알아서 변경된 e.target.value를 자기 장부에 0.001초만에 동기화시킵니다!
                        }
                    })}
                />
                <button 
                    type="button"
                    className="secondary"
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={handleNicknameDuplicate}
                    disabled={isPending || !currentNickname.trim()}
                >
                    중복확인
                </button>
            </div>

            {/* 에러메시지 출력 공간 */}
            {errors.nickname && (
                <small
                    style={{ color: 'var(--pico-form-element-invalid-border-color)' }}
                >
                    {errors.nickname.message}
                </small>
            )}

            {/* 성공메시지 출력 공간 */}
            {!errors.nickname && successMessage && (
                <small
                    style={{ color: 'var(--pico-form-element-valid-border-color)' }}
                >
                    {successMessage}
                </small>
            )}
        </label>
    );
};