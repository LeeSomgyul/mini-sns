import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useKakaoLoginMutation } from "../hooks/useKakaoLoginMutation";

const KakaoCallbackPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isProcessed = useRef(false);
    
    const { mutate, isPending } = useKakaoLoginMutation();

    useEffect(() => {
        if (isProcessed.current) return;

        // URL에서 카카오가 제공하는 ?code=어쩌고저쩌고 추출
        const code = searchParams.get("code");

        if (!code) {
            alert("카카오 로그인 코드를 찾을 수 없습니다.");
            navigate("/login", { replace: true });
            return;
        }

        isProcessed.current = true;
        
        mutate(code);

    }, [searchParams, navigate, mutate]);

    return (
        <main className="container">
            <div style={{ textAlign: "center", marginTop: "50px" }}>
                <h2>카카오 로그인 처리 중입니다...</h2>
                {isPending && <p>잠시만 기다려주세요 ⏳</p>}
            </div>
        </main>
    );
};

export default KakaoCallbackPage;