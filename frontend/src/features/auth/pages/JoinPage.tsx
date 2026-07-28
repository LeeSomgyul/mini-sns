import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";

import { joinSchema, type JoinFormValues } from "../schemas/joinSchema";
import { useJoinMutation } from "../hooks/useJoinMutation";
import { useCheckNickNameMutation, useEmailSendMutation, useEmailVerifyMutation } from "../hooks/useAuthMutation";
import { ROUTES } from "../../../constants/routes";


const JoinPage = () => {
    const navigate = useNavigate();

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
    const currentNickname = watch("nickname");

    // --- 핸들러 함수들 ---

    // [닉네임 중복 체크] (닉네임 input의 onBlur와 "중복확인" 버튼 클릭 양쪽에서 재사용)
    const handleNicknameCheck = async (nickname: string) => {
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
                    navigate(ROUTES.LOGIN, {replace: true});
                },
                onError: (error) => {
                    if (error instanceof AxiosError) {
                        alert(error.response?.data?.message || "회원가입 중 오류가 발생했습니다.");
                    }
                }
            }
        );
    };

    const textInputClass = "h-[60px] w-full rounded-[14px] border-none bg-white px-[18px] text-sm text-gray-700 outline-none placeholder:text-gray-400";
    const labelClass = "mb-1.5 block text-base font-bold text-gray-900";
    const sideButtonClass = "w-[118px] shrink-0 rounded-[14px] bg-[#595959] hover:bg-[#6b6b6b] text-[13.5px] font-normal text-[#ffffff] cursor-pointer disabled:opacity-60";
    const fieldErrorClass = "mt-1 block text-xs text-red-500";

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#f5f6f3] px-4 py-10 md:px-0 md:py-0">
            {/* 오로라 메쉬 그라데이션 배경 */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(92,200,241,0.6),transparent_55%),radial-gradient(circle_at_100%_0%,rgba(247,220,163,0.6),transparent_55%),radial-gradient(circle_at_0%_100%,rgba(214,222,159,0.55),transparent_55%),radial-gradient(circle_at_100%_100%,rgba(238,199,211,0.6),transparent_55%)]" />

            {/* 프로스티드 글래스 패널 */}
            <div className="relative flex min-h-screen w-full items-center justify-center md:absolute md:inset-y-0 md:right-0 md:w-[68%] md:items-center md:justify-start md:pl-16 md:bg-black/5 md:backdrop-blur-2xl">
                <div className="flex w-full max-w-[594px] flex-col">

                    {/* 상단: 뒤로가기 + 타이틀 */}
                    <div className="mb-8 flex items-center gap-3.5">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border-none bg-white cursor-pointer"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                <path d="M15 5l-8 7 8 7" stroke="#1c1c21" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <h1 className="text-[26px] font-bold text-gray-900">회원가입</h1>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">

                        {/* 1. 이메일 입력 영역 */}
                        <div>
                            <label className={labelClass}>아이디(이메일)</label>
                            <div className="flex gap-2.5">
                                <input
                                    type="email"
                                    placeholder="아이디(이메일)를 입력하세요"
                                    readOnly={emailState.isVerified}
                                    className={`flex-1 ${textInputClass}`}
                                    {...register("email", {
                                        onChange: () => {
                                            // 이메일을 수정하면 인증 상태 초기화
                                            if (emailState.isSent || emailState.isVerified) {
                                                setEmailState({ isSent: false, isVerified: false, code: "", token: "", serverError: "" });
                                            }
                                        }
                                    })}
                                />

                                {!emailState.isVerified ? (
                                    <button type="button" onClick={handleSendEmailCode} disabled={isEmailSending} className={sideButtonClass}>
                                        {isEmailSending ? "전송 중..." : (emailState.isSent ? "재전송" : "인증번호 전송")}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setEmailState({ isSent: false, isVerified: false, code: "", token: "", serverError: "" })}
                                        className={sideButtonClass}
                                    >
                                        이메일 변경
                                    </button>
                                )}
                            </div>
                            {errors.email && <span className={fieldErrorClass}>{errors.email.message}</span>}
                        </div>

                        {/* 2. 이메일 인증번호 입력 영역 */}
                        {emailState.isSent && !emailState.isVerified && (
                            <div>
                                <label className={labelClass}>인증번호</label>
                                <div className="flex gap-2.5">
                                    <input
                                        type="text"
                                        placeholder="인증번호를 입력하세요"
                                        maxLength={6}
                                        value={emailState.code}
                                        onChange={(e) => setEmailState(prev => ({ ...prev, code: e.target.value.replace(/[^0-9]/g, "") }))}
                                        className={`flex-1 ${textInputClass}`}
                                    />
                                    <button type="button" onClick={handleVerifyToken} disabled={isEmailVerifying} className={sideButtonClass}>
                                        {isEmailVerifying ? "확인 중..." : "인증하기"}
                                    </button>
                                </div>
                                {emailState.serverError && <span className={fieldErrorClass}>{emailState.serverError}</span>}
                            </div>
                        )}

                        {/* 3. 비밀번호 입력 영역 */}
                        <div>
                            <label className={labelClass}>비밀번호</label>
                            <input type="password" placeholder="비밀번호를 입력하세요" {...register("password")} className={textInputClass} />
                            {errors.password && <span className={fieldErrorClass}>{errors.password.message}</span>}
                        </div>

                        <div>
                            <label className={labelClass}>비밀번호 확인</label>
                            <input type="password" placeholder="비밀번호를 다시 입력하세요" {...register("passwordConfirm")} className={textInputClass} />
                            {errors.passwordConfirm && <span className={fieldErrorClass}>{errors.passwordConfirm.message}</span>}
                        </div>

                        {/* 4. 닉네임 입력 영역 */}
                        <div>
                            <label className={labelClass}>닉네임</label>
                            <div className="flex gap-2.5">
                                <input
                                    type="text"
                                    placeholder="닉네임을 입력하세요"
                                    maxLength={10}
                                    {...register("nickname", {
                                        onChange: () => setIsNicknameChecked(false),
                                        onBlur: (e) => handleNicknameCheck(e.target.value)
                                    })}
                                    className={`flex-1 ${textInputClass}`}
                                />
                                <button type="button" onClick={() => handleNicknameCheck(currentNickname)} className={sideButtonClass}>
                                    중복확인
                                </button>
                            </div>
                            {errors.nickname && <span className={fieldErrorClass}>{errors.nickname.message}</span>}
                            {!errors.nickname && isNicknameChecked && (
                                <span className="mt-1 block text-xs text-emerald-600">사용 가능한 닉네임입니다.</span>
                            )}
                        </div>

                        {/* 5. 이름 입력 영역 */}
                        <div>
                            <label className={labelClass}>이름</label>
                            <input type="text" placeholder="이름을 입력하세요 (선택)" {...register("name")} className={textInputClass} />
                            {errors.name && <span className={fieldErrorClass}>{errors.name.message}</span>}
                        </div>

                        {/* 6. 전화번호 입력 영역 */}
                        <div>
                            <label className={labelClass}>휴대폰 번호</label>
                            <input
                                type="tel"
                                placeholder="휴대폰 번호를 입력하세요 (선택)"
                                maxLength={11}
                                {...register("phoneNumber", {
                                    onChange: (e) => {
                                        e.target.value = e.target.value.replace(/\D/g, "");
                                    }
                                })}
                                className={textInputClass}
                            />
                            {errors.phoneNumber && <span className={fieldErrorClass}>{errors.phoneNumber.message}</span>}
                        </div>

                        {/* 7. 제출 버튼 */}
                        <button
                            type="submit"
                            aria-busy={isJoining}
                            disabled={!isValid || !isNicknameChecked || isJoining}
                            className="mt-2 h-[60px] w-full rounded-[14px] border-none bg-[#000000] hover:bg-[#2d2d2d] text-base font-normal text-white cursor-pointer transition-colors"
                        >
                            {isJoining ? "가입 처리 중..." : "회원가입 완료"}
                        </button>
                    </form>

                    <div className="mt-[22px] text-center text-[13px] text-[#7a7a82]">
                        이미 계정이 있으신가요?{" "}
                        <a href="/login" className="font-semibold text-gray-900">로그인 &gt;</a>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default JoinPage;
