import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";

import { joinSchema, type JoinFormValues } from "../schemas/joinSchema";
import { useJoinMutation } from "../hooks/useJoinMutation";
import { useCheckNickNameMutation, useEmailSendMutation, useEmailVerifyMutation } from "../hooks/useAuthMutation";

const JoinPage = () => {
    // 1. 리엑트 훅 설정 
    const { 
        register, 
        handleSubmit, 
        formState: { errors, isValid }, 
        watch, 
        setError, 
        clearErrors, 
        trigger 
    } = useForm<JoinFormValues>({
        resolver: zodResolver(joinSchema),
        mode: "onBlur", 
    });

    // 2. API 연결
    const { mutateAsync: checkNickname } = useCheckNickNameMutation();
    const { mutateAsync: sendEmail, isPending: isEmailSending } = useEmailSendMutation();
    const { mutateAsync: verifyEmail, isPending: isEmailVerifying } = useEmailVerifyMutation();
    const { mutate: join, isPending: isJoining } = useJoinMutation();

    // 3. 이메일 인증을 위한 상태 관리
    const [emailState, setEmailState] = useState({
        isSent: false,
        isVerified: false,
        code: "",
        token: "",
        serverError: ""
    });

    //이메일 입력 실시간 감시
    const currentEmail = watch("email");

    //닉네임 중복체크 상태
    const [isNicknameChecked, setIsNicknameChecked] = useState(false);

    // --- 핸들러 함수들 ---

    // [닉네임 중복 체크]
    const handleNicknameBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const nickname = e.target.value;
        const isFormatValid = await trigger("nickname");
        
        if (!isFormatValid) return;

        try {
            const response = await checkNickname(nickname);
            
            if (response.exists) {
                setError("nickname", { type: "manual", message: "이미 사용 중인 닉네임입니다." });
                setIsNicknameChecked(false);
            } else {
                clearErrors("nickname");
                setIsNicknameChecked(true);
            }
        } catch {
            setError("nickname", { type: "manual", message: "중복 체크 중 오류가 발생했습니다." });
            setIsNicknameChecked(false);
        }
    };

    // [이메일 인증 번호 발송]
    const handleSendEmailCode = async () => {
        const isEmailFormatValid = await trigger("email");
        if (!isEmailFormatValid) return;

        try {
            await sendEmail({ email: currentEmail });
            setEmailState(prev => ({ ...prev, isSent: true, serverError: "" }));
            alert("인증번호가 발송되었습니다.");
        } catch (error) {
            if (error instanceof AxiosError) {
                setEmailState(prev => ({ ...prev, serverError: error.response?.data?.message || "발송 실패" }));
            }
        }
    };

    // [이메일 인증 번호 확인]
    const handleVerifyToken = async () => {
        if (emailState.code.length !== 6) {
            setEmailState(prev => ({ ...prev, serverError: "인증번호 6자리를 입력해주세요." }));
            return;
        }

        try {
            const response = await verifyEmail({ email: currentEmail, code: emailState.code });
            // 성공 시 발급받은 토큰 저장
            setEmailState(prev => ({ 
                ...prev, 
                isVerified: true, 
                isSent: false, 
                token: response.verifyToken, 
                serverError: "" 
            }));
            alert("인증에 성공하였습니다.");
        } catch (error) {
            if (error instanceof AxiosError) {
                setEmailState(prev => ({ ...prev, serverError: error.response?.data?.message || "인증 실패" }));
            }
        }
    };

    // 최종 회원가입 제출
    const onSubmit = (formData: JoinFormValues) => {
        if (!emailState.isVerified || !emailState.token) {
            alert("이메일 인증을 완료해주세요.");
            return;
        }

        // useJoinMutation으로 폼 데이터와 토큰 전달
        join(
            { formData, verificationToken: emailState.token }, 
            {
                onSuccess: (response) => {
                    alert(`${response.nickname}님, 회원가입이 완료되었습니다.`);
                    window.location.href = "/login";
                },
                onError: (error) => {
                    if (error instanceof AxiosError) {
                        alert(error.response?.data?.message || "회원가입 중 오류가 발생했습니다.");
                    }
                }
            }
        );
    };

    return (
        <main className="container">
            <article className="grid">
                <div>
                    <hgroup>
                        <h1>로고</h1>
                        <h2>서비스 관련 그래픽 요소</h2>
                    </hgroup>
                </div>

                <div>
                    <h2>회원가입</h2>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        
                        {/* 1. 이메일 입력 영역 */}
                        <div className="grid">
                            <div>
                                <input
                                    type="email"
                                    placeholder="이메일"
                                    readOnly={emailState.isVerified}
                                    {...register("email", {
                                        onChange: () => {
                                            // 이메일을 수정하면 인증 상태 초기화
                                            if (emailState.isSent || emailState.isVerified) {
                                                setEmailState({ isSent: false, isVerified: false, code: "", token: "", serverError: "" });
                                            }
                                        }
                                    })}
                                />
                                {errors.email && <span>{errors.email.message}</span>}
                            </div>
                            
                            {!emailState.isVerified ? (
                                <button type="button" onClick={handleSendEmailCode} disabled={isEmailSending}>
                                    {isEmailSending ? "전송 중..." : (emailState.isSent ? "재전송" : "인증번호 전송")}
                                </button>
                            ) : (
                                <button type="button" onClick={() => setEmailState({ isSent: false, isVerified: false, code: "", token: "", serverError: "" })}>
                                    이메일 변경
                                </button>
                            )}
                        </div>

                        {/* 2. 이메일 인증번호 입력 영역 */}
                        {emailState.isSent && !emailState.isVerified && (
                            <div className="grid">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="인증번호 6자리"
                                        maxLength={6}
                                        value={emailState.code}
                                        onChange={(e) => setEmailState(prev => ({ ...prev, code: e.target.value.replace(/[^0-9]/g, "") }))}
                                    />
                                    {emailState.serverError && <span>{emailState.serverError}</span>}
                                </div>
                                <button type="button" onClick={handleVerifyToken} disabled={isEmailVerifying}>
                                    {isEmailVerifying ? "확인 중..." : "인증하기"}
                                </button>
                            </div>
                        )}

                        {/* 3. 비밀번호 입력 영역 */}
                        <input type="password" placeholder="비밀번호" {...register("password")} />
                        {errors.password && <span>{errors.password.message}</span>}

                        <input type="password" placeholder="비밀번호 확인" {...register("passwordConfirm")} />
                        {errors.passwordConfirm && <span>{errors.passwordConfirm.message}</span>}

                        {/* 4. 닉네임 입력 영역 */}
                        <input 
                            type="text" 
                            placeholder="닉네임" 
                            maxLength={10}
                            {...register("nickname", { 
                                onChange: () => setIsNicknameChecked(false),
                                onBlur: handleNicknameBlur 
                            })} 
                        />
                        {errors.nickname && <span>{errors.nickname.message}</span>}
                        {!errors.nickname && isNicknameChecked && (
                            <span>사용 가능한 닉네임입니다.</span>
                        )}

                        {/* 5. 이름 입력 영역 */}
                        <input type="text" placeholder="이름 (선택)" {...register("name")} />
                        {errors.name && <span>{errors.name.message}</span>}

                        {/* 6. 전화번호 입력 영역 */}
                        <input 
                            type="tel"
                            placeholder="전화번호 숫자 11자리 (선택)"
                            maxLength={11}
                            {...register("phoneNumber", {
                                onChange: (e) => {
                                    e.target.value = e.target.value.replace(/\D/g, "");
                                }
                            })} />
                        {errors.phoneNumber && <span>{errors.phoneNumber.message}</span>}

                        {/* 7. 제출 버튼 */}
                        <button 
                            type="submit" 
                            aria-busy={isJoining} 
                            disabled={!isValid || !isNicknameChecked || isJoining}
                        >
                            {isJoining ? "가입 처리 중..." : "회원가입"}
                        </button>
                    </form>

                    <div>
                        <span>
                            이미 계정이 있으신가요? <a href="/login">로그인 ➡️</a>
                        </span>
                    </div>
                </div>
            </article>
        </main>
    );
};

export default JoinPage;