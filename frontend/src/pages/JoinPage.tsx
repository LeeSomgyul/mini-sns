import { useState, type SubmitEventHandler, type ChangeEventHandler, type FocusEventHandler, type MouseEventHandler } from "react";
import api from "../api/axios";
import axios, { AxiosError } from "axios";

const JoinPage = () => {

    //사용자 입력값 상태 관리 (최종 DB에 저장될 회원가입용 데이터)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        passwordConfirm: '',
        nickname: '',
        name: '',
        phoneNumber: ''
    });

    //입력 창을 건드린 적이 있는가? (input창 에러 메시지 전용)
    const [touched, setTouched] = useState({
        email: false,
        password: false,
        passwordConfirm: false,
        nickname: false,
        name: false,
        phoneNumber: false
    });

    //입력창 에러 상태 관리
    const [inputErrors, setInputErrors] = useState({
        email: '',
        password: '',
        passwordConfirm: '',
        nickname: '',
        name: '',
        phoneNumber: ''
    });

    const [serverErrors, setServerErrors] = useState('');//서버 에러 상태 관리
    const [isLoading, setIsLoading] = useState(false);//기본 에러 관리(UI, 유효성검사 등)
    
    const [emailVerifiedCode, setEmailVerifiedCode] = useState('');//사용자가 입력한 이메일 인증 코드
    const [isEmailSent, setIsEmailSent] = useState(false);//이메일 발송 여부
    const [isEmailVerified, setIsEmailVerified] = useState(false);//이메일 최종 인증 상태 관리
    const [emailErrors, setEmailErrors] = useState('');//이메일 인증 에러 메시지
    const [emailVerifyToken, setEmailVerifyToken] = useState('');//이메일 인증 성공 시 백엔드에서 전송하는 토큰 

    const [isNicknameChecked, setIsNicknameChecked] = useState(false);//닉네임 중복 상태 관리
    
    //유효성 검사 (통과하면 true 저장)
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const passwordValid = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{10,20}$/.test(formData.password);
    const nicknameValid = /^[가-힣a-zA-Z0-9]{2,10}$/.test(formData.nickname);
    const nameValid = /^[가-힣a-zA-Z]{1,10}$/.test(formData.name);
    const phoneNumberValid = /^[0-9]{11}$/.test(formData.phoneNumber);

    //회원가입 버튼 활성화 조건
    const isFormValid = 
        emailValid && //이메일 형식이 맞는가?
        passwordValid && //비밀번호 형식이 맞는가?
        (formData.password === formData.passwordConfirm) && //비밀번호 = 비밀번호 확인?
        nicknameValid &&//닉네임 형식이 맞는가?
        (formData.name === '' || nameValid) &&//이름 형식이 맞는가?
        (formData.phoneNumber === '' || phoneNumberValid) &&//전화번호 형식이 맞는가?
        isEmailVerified &&//이메일 중복 인증 통과?
        isNicknameChecked;//닉네임 중복 인증 통과?

    //입력 핸들러
    const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        const { name, value } = e.target;//input에서 name이라는 key, 실제 값 가져오기
        const cleanValue = value.replace(/\s/g, '');//입력 값의 모든 공백 제거

        setFormData(prev => ({
            ...prev,//가장 최신 상태의 모든 입력 값
            [name]: cleanValue//그 중 name 칸만 새 값으로 변경 
        }));

        //다시 입력 시작하면 에러메시지 제거하기
        setInputErrors(prev => ({
            ...prev,
            [name]: ''
        }));

        //닉네임 글자가 바뀌면 다시 중복체크 해야 함
        if(name == 'nickname'){
            setIsNicknameChecked(false);
        }
    };

    //이메일 전용 입력 핸들러
    const handleEmailInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        
        //handleInputChange함수 먼저 실행
        handleInputChange(e);

        setEmailErrors('');

        //이메일 글자 바뀌었는데 기존에 인증 발송/완료 상태라면? -> 다 초기화
        if(isEmailSent || isEmailVerified){
            setEmailVerifiedCode('');
            setIsEmailSent(false);
            setIsEmailVerified(false);
            setEmailVerifyToken('');
        }
    };

    //이메일 인증코드 전용 입력 핸들러
    const handleEmailCodeInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        
        const {value} = e.target;//사용자가 입력한 인증코드
        const numberOnlyCode = value.replace(/[^0-9]/g, ''); //숫자만 입력되도록 정규식 처리

        setEmailVerifiedCode(numberOnlyCode);//인증코드 저장

        if(emailErrors){
            setEmailErrors('');//이메일 오류메시지 공백으로 초기화
        }
    };

    //에러메시지 핸들러
    const handleBlur: FocusEventHandler<HTMLInputElement> = async(e) => {
        const { name, value } = e.target;

        //해당 input창을 건드렸다고 표시
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));

        //필수 입력 항목 리스트(이메일, 비밀번호, 비밀번호확인, 닉네임)
        const requiredFields = ['email', 'password', 'passwordConfirm', 'nickname'];

        //상황별 에러메시지 저장
        let errorMessage = '';

        //---1단계: 프론트엔드 유효성 검사---
        if(value.trim() === ''){
            //입력창 클릭만 하고 입력하지 않고 떠나면 
            if(requiredFields.includes(name)){
                errorMessage = '필수 입력입니다.';
            }
        }else{
            //입력 후 유효성 검사 불통과 시
            if(name === 'email' && !emailValid) errorMessage = '올바른 이메일 형식이 아닙니다.';
            if(name === 'password' && !passwordValid) errorMessage = '비밀번호는 10~20자, 영문/숫자/특수문자를 포함해야 합니다.';
            if(name === 'passwordConfirm' && formData.password !== value) errorMessage = '비밀번호가 일치하지 않습니다.';
            if(name === 'nickname' && !nicknameValid) errorMessage = '닉네임은 2~10자의 한글, 영문, 숫자만 가능합니다.';
            if(name === 'name' && !nameValid) errorMessage = '이름은 한글과 영문 1~10자 이내로 입력 가능합니다.';
            if(name === 'phoneNumber' && !phoneNumberValid) errorMessage = '전화번호는 11자리 숫자만 가능합니다.';
        }

        //입력창 에러 상태 업데이트
        setInputErrors(prev => ({
            ...prev,
            [name]: errorMessage
        }));

        //---2단계: 백엔드 API 닉네임 중복 검증---
        if(name === 'nickname' && errorMessage === ''){

            setIsLoading(true);

            try{
                const response = await api.get(`/api/v1/users/nickname/exists?nickname=${value}`);
                const result = response.data;

                //이미 존재하는 닉네임이라면
                if(result.data.exists){
                    setInputErrors(prev => ({...prev, nickname: "이미 사용 중인 닉네임입니다."}));
                    setIsNicknameChecked(false);
                }else{
                    //중복되지 않는 닉네임이라면
                    setInputErrors(prev => ({...prev, nickname: '사용 가능한 닉네임입니다.'}));
                    setIsNicknameChecked(true);
                }

            }catch(error){
                setInputErrors(prev => ({...prev, nickname: '서버와 통신 중 오류가 발생했습니다.'}));
                setIsNicknameChecked(false);
            }finally{
                setIsLoading(false);
            }
        }
    };

    //이메일 인증번호 발송 버튼 (이메일 발송)
    const handleSendEmailCode: MouseEventHandler<HTMLButtonElement> = async(e) => {
        e.preventDefault();

        setEmailErrors('');
        setIsLoading(true);

        try{
            const request = {
                email: formData.email
            };

            const response = await api.post('/api/v1/auth/email/send', request);

            if(response.status === 200){
                alert('인증번호가 발송되었습니다.');
                setIsEmailSent(true);
            }
        }catch(error){
            if(error instanceof AxiosError){
                if(error.response){
                    const status = error.response?.status;
                    const serverMessage = error.response?.data?.message;

                    if(status >= 400 && status <500){
                        setEmailErrors(serverMessage || '인증번호를 다시 발송해주세요.');
                    }else{
                        setServerErrors('현재 서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
                    }
                }
            }
        }finally{
            setIsLoading(false);
        }
    };

    //모든 이메일 관련 상태 초기화 메서드 
    const resetEmailState = () => {
        setIsEmailVerified(false);
        setIsEmailSent(false);
        setEmailVerifiedCode('');
        setEmailErrors('');
        setEmailVerifyToken('');
    };

    //이메일 재전송 버튼
    const handleResetEmail: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault();
        resetEmailState();
    };

    //이메일 인증하기 버튼 (이메일 검증)
    const handleVerifyToken: MouseEventHandler<HTMLButtonElement> = async(e) => {
        e.preventDefault();

        //인증번호 6자리 입력 확인
        if(emailVerifiedCode.length < 6 || emailVerifiedCode.length > 6){
            setEmailErrors('인증번호는 6자리를 입력해주세요.');
            return;
        }

        setIsLoading(true);

        try{
            const request = {
                email: formData.email,
                code: emailVerifiedCode
            };

            const response = await api.post('/api/v1/auth/email/verify', request);

            if(response.status === 200){
                alert('인증에 성공하였습니다.');

                setIsEmailVerified(true);
                setEmailErrors('');

                const verifyToken = response.data?.data?.verifyToken;
                if(verifyToken){
                    setEmailVerifyToken(verifyToken);
                }
                
            }
        }catch(error){
            if(error instanceof AxiosError){
                const status = error.response?.status;
                const serverMessage = error.response?.data?.message;

                if(status === 400){
                    setEmailErrors(serverErrors);
                }else if(status === 429){
                    setEmailErrors(serverErrors);
                    reset
                }
            }

        }finally{
            setIsLoading(false);
        }

    };

    //회원가입 버튼
    const handleJoin: SubmitEventHandler<HTMLFormElement> = async(e) => {
        e.preventDefault();

        setServerErrors('');

        //모든 필드값을 건드림으로써 JoinPage 모든 상태값을 최신값으로 변경
        setTouched({
            email: true,
            password: true,
            passwordConfirm: true,
            nickname: true,
            name: true,
            phoneNumber: true
        });

        //모든 유효성 검사 통과 안하면 멈춤
        if(!isFormValid){
            setServerErrors('입력하신 정보를 다시 확인해주세요.');
            return;
        }

        //모든 검사 통과 안하면 멈춤 
        if(!emailVerifyToken){
            setServerErrors('이메일 인증을 완료해주세요.');
            return;
        }

        setIsLoading(true);//모든 검사 통과했다면 로딩 시작

        try{
            const request = {
                email: formData.email,
                password: formData.password,
                passwordConfirm: formData.passwordConfirm,
                nickname: formData.nickname,
                name: formData.name,
                phoneNumber: formData.phoneNumber,
                verificationToken: emailVerifyToken,
                deviceToken: ""
            };

            const response = await api.post('/api/v1/auth/join', request);

            if(response.status === 201){
                alert('회원가입이 완료되었습니다.');
                window.location.href = '/login';
            }

        }catch(error){
            if(error instanceof AxiosError){
                if(error.response){
                    const status = error.response?.status;//백엔드에서 보내주는 상태코드
                    const serverMessage = error.response?.data?.message;//백엔드에서 보내주는 에러 메시지
                    
                    if(status >= 400 && status < 500){
                        //400번대 에러
                        setServerErrors(serverMessage || '입력하신 정보를 다시 확인해주세요.');
                    }else{
                        //500번대 에러
                        setServerErrors('현재 서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
                    }
                }else{
                    setServerErrors('서버와 연결할 수 없습니다.');
                }
            }else{
                setServerErrors('알 수 없는 오류가 발생했습니다.');
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
                        <h2>서비스 관련 그래픽 요소</h2>
                    </hgroup>
                </div>

                {/* 오른쪽: 로그인 폼 영역 */}
                <div>
                    <h2>회원가입</h2>
                    <form onSubmit={handleJoin} noValidate>
                        {/* 이메일 */}
                        <div>
                            <div className="grid">
                                {/* 이메일 입력란 */}
                                <input
                                name="email"
                                type="email"
                                placeholder="이메일"
                                value={formData.email}
                                onChange={handleEmailInputChange}
                                onBlur={handleBlur}
                                disabled={isEmailVerified}
                                />
                                
                                {/* 이메일 인증 버튼 */}
                                {!isEmailVerified && (
                                    <button
                                    type="button"
                                    className=""
                                    onClick={handleSendEmailCode} 
                                >
                                    {isEmailSent ? "재전송" : "인증번호 전송"}
                                </button>
                                )} 

                                {/* 이메일 변경 버튼 (이메일 인증 완료 시) */}
                                {isEmailVerified && (
                                    <button
                                    type="button"
                                    className=""
                                    onClick={handleResetEmail} 
                                >
                                    이메일 변경
                                </button>
                                )}
                            </div>

                            {touched.email && inputErrors.email && (
                                    <span>
                                        {inputErrors.email}
                                    </span>
                                )}
                        </div>

                        {/* 이메일 인증 */}
                        {isEmailSent && !isEmailVerified && (
                            <div>
                                <div className="grid">
                                    {/* 이메일 인증번호 입력란 */}
                                    <input
                                        name="emailCode"
                                        type="text"
                                        placeholder="인증번호 6자리"
                                        value = {emailVerifiedCode}
                                        maxLength={6}
                                        onChange={handleEmailCodeInputChange}
                                    />
                                    {/* 이메일 인증확인 버튼*/}
                                    <button
                                        type="button"
                                        onClick={handleVerifyToken}
                                    >
                                        인증하기
                                    </button>
                                </div>
                                {emailErrors && (
                                    <span>{emailErrors}</span>
                                )}
                            </div>
                        )}
                        

                        {/* 비밀번호 입력란 */}
                        <input
                            name="password"
                            type="password"
                            placeholder="비밀번호 (10~20자, 영문/숫자/특수문자 포함)"
                            value={formData.password}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                        />
                        {touched.password && inputErrors.password && (
                            <span>
                                {inputErrors.password}
                            </span>
                        )}
                        
                        {/* 비밀번호 확인 입력란 */}
                        <input
                            name="passwordConfirm"
                            type="password"
                            placeholder="비밀번호 확인"
                            value={formData.passwordConfirm}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                        />
                        <span>
                            {touched.passwordConfirm && inputErrors.passwordConfirm && (
                                <span>
                                    {inputErrors.passwordConfirm}
                                </span>
                            )}
                        </span>
                        {/* 닉네임 영역 */}
                        <div className="gird">
                            <input
                                name="nickname"
                                type="text"
                                placeholder="닉네임 (2~10자, 특수문자 불가)"
                                value={formData.nickname}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                maxLength={10}
                            />
                            {touched.nickname && inputErrors.nickname && (
                                <span>
                                    {inputErrors.nickname}
                                </span>
                            )}
                        </div>

                        {/* 이름 영역 */}
                        <input
                            name="name"
                            type="text"
                            placeholder="이름 (선택)"
                            value={formData.name}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                        />
                        {touched.name && inputErrors.name && (
                            <span>
                                {inputErrors.name}
                            </span>
                        )}

                        {/* 전화번호 영역 */}
                        <input
                            name="phoneNumber"
                            type="tel"
                            placeholder="전화번호 숫자 11자리 (선택)"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            maxLength={11}
                        />
                        {touched.phoneNumber && inputErrors.phoneNumber && (
                            <span>
                                {inputErrors.phoneNumber}
                            </span>
                        )}

                        {/* 전역 에러 메시지(비상용)*/}
                        {serverErrors && (
                            <span>
                                {serverErrors}
                            </span>
                        ) }

                        {/* 회원가입 버튼 */}
                        <button
                            type="submit"
                            aria-busy = {isLoading}
                            disabled = {!isFormValid || isLoading}
                        >
                            {isLoading ? '가입 처리 중...' : '회원가입'}
                        </button>
                    </form>

                    {/* 로그인 이동 */}
                    <div>
                        <span>
                            이미 계정이 있으신가요?
                            <a href="/login">로그인➡️ </a>
                        </span>
                    </div>
                </div>
            </article>
        </main>
    );
};

export default JoinPage;