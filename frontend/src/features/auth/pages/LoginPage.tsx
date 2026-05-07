import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";

import { loginSchema, type LoginFormValues } from "../schemas/loginSchema";
import { useLoginMutation } from "../hooks/useLoginMutation";

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
        <main className="container">
            <article className="grid">
                {/* 왼쪽: 로고 및 그래픽 영역 */}
                <div>
                    <hgroup>
                        <h1>로고</h1>
                        <p>서비스 관련 그래픽 요소</p>
                    </hgroup>
                </div>

                {/* 오른쪽: 로그인 폼 영역 */}
                <div>
                    <h2>로그인</h2>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        {/* 이메일 영역 */}
                        <input
                            type="email"
                            placeholder="이메일"
                            aria-invalid={errors.email ? "true" : "false"}
                            {...register("email")}
                        />
                        {errors.email && <small>{errors.email.message}</small>}

                        {/* 비밀번호 영역 */}
                        <input
                            type="password"
                            placeholder="비밀번호"
                            aria-invalid={errors.password ? "true" : "false"}
                            {...register("password")}
                        />
                        {errors.password && <small>{errors.password.message}</small>}

                        {/* 서버 측 에러 메시지 노출 */}
                        {serverErrorMessage && <mark>{serverErrorMessage}</mark>}

                        {/* 로그인 버튼 */}
                        <button type="submit" aria-busy={isPending} disabled={isPending}>
                            {isPending ? "로그인 중..." : "로그인"}
                        </button>
                    </form>

                    {/* 카카오 로그인 버튼 */}
                    <button 
                        className="secondary outline"
                        type="button"
                        onClick={handleKakaoLogin}
                    >
                        카카오 로그인
                    </button>

                    {/* 회원가입 이동 */}
                    <div>
                        <span>
                            계정이 없으신가요?
                            <a href="/join">회원가입➡️ </a>
                        </span>
                    </div>
                </div>
            </article>
        </main>
    );
};

export default LoginPage;