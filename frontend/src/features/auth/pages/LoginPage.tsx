import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";

import { loginSchema, type LoginFormValues } from "../schemas/loginSchema";
import { useLoginMutation } from "../hooks/useLoginMutation";
import LoginArtwork from "../components/LoginArtwork";

const LoginPage = () => {
    // 1. API 통신 이후 응답
    // mutate: API 실행시키는 함수
    // isPending: 통신이 진행중인지 상태(true: 로딩중, false: 완료)
    // error: 통신 실패 시 에러 정보
    const { mutate, isPending, error } = useLoginMutation();

    // 2. React Hook Form 설정 및 Zod 스키마 연결
    // register: <input> 태그에서 value, onChange 메서드 해결 
    // handleSubmit: 로그인 폼 제출 시 호출되는 함수 (예: handleSubmit(onSubmit) 하면 onSubmit 함수가 실행됨)
    // error: 유효성 검사 오류 내용
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        mode: "onBlur", 
    });

    // 3. 폼 제출 (사용자가 입력한 email, password를 LoginFormVlues로 넘기기)
    const onSubmit = (data: LoginFormValues) => {
        mutate(data);
    };

    // 4. 카카오 로그인
    const handleKakaoLogin = () => {
        const KAKAO_RESTAPI_KEY = import.meta.env.VITE_KAKAO_RESTAPI_KEY;
        const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;
        window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_RESTAPI_KEY}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code&prompt=login`;
    };

    // 5. 서버 측 에러 메시지 추출
    const serverErrorMessage = error instanceof AxiosError 
        ? error.response?.data?.message 
        : null;

    return(
        <main className="min-h-screen flex items-center justify-center bg-white px-4">
            <div className="grid grid-cols-1 md:grid-cols-[696px_1fr] gap-0 w-full max-w-[1160px] h-auto md:h-[700px] rounded-[32px] overflow-hidden shadow-[0_24px_60px_rgba(20,20,30,0.10)]">
                {/* 왼쪽: 로고 및 그래픽 영역 */}
                <div className="hidden md:block relative m-5 rounded-[30px] overflow-hidden bg-[#f6f6f4] bg-[radial-gradient(at_0%_0%,rgba(92,200,241,0.6)_0px,transparent_50%),radial-gradient(at_100%_0%,rgba(247,220,163,0.6)_0px,transparent_50%),radial-gradient(at_0%_100%,rgba(214,222,159,0.6)_0px,transparent_50%),radial-gradient(at_100%_100%,rgba(238,199,211,0.6)_0px,transparent_50%)] bg-[length:200%_200%] animate-aurora">
                    <LoginArtwork />
                </div>

                {/* 오른쪽: 로그인 폼 영역 */}
                <div className="flex flex-col justify-center px-8 md:px-14 py-10 bg-white">
                    <h2 className="text-2xl font-bold text-gray-900 mb-9">로그인</h2>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3.5">
                        {/* 이메일 영역 */}
                        <input
                            type="email"
                            placeholder="이메일"
                            aria-invalid={errors.email ? "true" : "false"}
                            className="h-[52px] rounded-[14px] border-none bg-[#f3f4f6] px-[18px] text-sm text-gray-700 outline-none placeholder:text-gray-400"
                            {...register("email")}
                        />
                        {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}

                        {/* 비밀번호 영역 */}
                        <input
                            type="password"
                            placeholder="비밀번호"
                            aria-invalid={errors.password ? "true" : "false"}
                            className="h-[52px] rounded-[14px] border-none bg-[#f3f4f6] px-[18px] text-sm text-gray-700 outline-none placeholder:text-gray-400"
                            {...register("password")}
                        />
                        {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}

                        {/* 서버 측 에러 메시지 노출 */}
                        {serverErrorMessage && <span className="text-xs text-red-500">{serverErrorMessage}</span>}

                        {/* 로그인 버튼 */}
                        <button
                            type="submit"
                            aria-busy={isPending}
                            disabled={isPending}
                            className="h-[52px] rounded-[14px] border-none bg-[#1c1c21] text-white text-[14.5px] font-medium mt-1 cursor-pointer disabled:opacity-60"
                        >
                            {isPending ? "로그인 중..." : "로그인"}
                        </button>
                    </form>

                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400">또는</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* 카카오 로그인 버튼 */}
                    <button
                        type="button"
                        onClick={handleKakaoLogin}
                        className="h-[52px] rounded-[14px] border-none bg-[#FEE500] text-gray-900 text-[14.5px] font-medium cursor-pointer"
                    >
                        카카오 로그인
                    </button>

                    {/* 회원가입 이동 */}
                    <div className="text-center mt-6 text-[13px] text-gray-400">
                        <span>
                            계정이 없으신가요?{" "}
                            <a href="/join" className="text-gray-900 font-semibold">회원가입 &gt;</a>
                        </span>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default LoginPage;