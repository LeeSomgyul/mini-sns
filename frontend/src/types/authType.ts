//AuthContext.tsx에서 사용되는 ts 코드

export interface AuthContextType{
    accessToken: string | null;//프론트에서 사용할 AccessToken
    setAccessToken: (token: string | null) => void;//AccessToken을 채워줄 메서드(서버에서 받아온 token을 프론트의 accessToken으로 사용한다)
    isLoading: boolean;//새로고침 시 accessToken유무를 검증하는 동안 렌더링 잠깐 멈추기 위해 상태 저장 
    logout: () => void;
}