import { useContext, useState, type SubmitEventHandler } from "react"
import { AuthContext } from "../context/AuthContext"
import api from "../api/axios";
import { AxiosError } from "axios";

const LoginPage = () => {

    //AccessToken 사용을 위한 전역 상태(AuthProvider)와 연결
    const authContext = useContext(AuthContext);
    if(!authContext){
        throw new Error("AuthProvider 안에서 사용해주세요.");
    }

    const {setAccessToken} = authContext;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    //로그인 핸들러
    const handleLogin: SubmitEventHandler<HTMLFormElement> = async(e) => {
        e.preventDefault();

        if(!email || !password){
            setErrorMessage('이메일과 비밀번호를 모두 입력해주세요.');
            return;
        }

        setIsLoading(true);//모든 검사 통과했다면 로딩 시작
        setErrorMessage('');

        try{
            const request = {
                email,
                password
            };

            const response = await api.post('/api/v1/auth/login', request);

            if(response.status === 200){
                const token = response.data.data.accessToken;
                setAccessToken(token);
                alert('로그인 성공! 환영합니다.');
            }
        }catch(error){
            if(error instanceof AxiosError){
                if(error.response){
                    const status = error.response?.status;//백엔드에서 보내주는 상태코드
                    const serverMessage = error.response?.data?.message;//백엔드에서 보내주는 에러 메시지
                    
                    if(status === 400 || status === 401){
                        setErrorMessage(serverMessage);
                    }else{
                        setErrorMessage('서버 오류가 발생했습니다. 잠시 후 시도해주세요.');
                    }
                }else{
                    setErrorMessage('서버와 연결할 수 없습니다.');
                }
            }else{
                setErrorMessage('알 수 없는 오류가 발생했습니다.');
            }
        }finally{
            setIsLoading(false);
        }
    };

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
                    <form onSubmit={handleLogin} noValidate>
                        {/* 이메일 영역 */}
                        <input
                            type="email"
                            placeholder="이메일"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {/* 비밀번호 영역 */}
                        <input
                            type="password"
                            placeholder="비밀번호"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {/* 에러 메시지 노출 */}
                        {errorMessage && (
                            <span>
                                {errorMessage}
                            </span>
                        )}
                        {/* 로그인 버튼 */}
                        <button
                            type = "submit"
                            aria-busy = {isLoading}
                            disabled = {isLoading}
                        >
                            {isLoading ? '로그인 중...' : '로그인'}
                        </button>
                    </form>
                    {/* 카카오 로그인 버튼 */}
                    <button className="secondary outline">
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