interface FeedErrorProps{
    message?: string;
    onRetry: () => void;
}

//[컴포넌트] 서버 응답 실패로 피드를 불러오지 못한 경우 화면
export const FeedError = ({message = "피드를 불러오지 못했습니다.", onRetry}: FeedErrorProps) => {
    return(
        <article style={{ textAlign: 'center', padding: '3rem', border: '1px solid #ffcccc' }}>
            <h4 style={{ color: '#d93526' }}>⚠️ 문제가 발생했습니다</h4>
            <p>{message}</p>
            <button 
                onClick={onRetry}
                style={{ backgroundColor: '#d93526', borderColor: '#d93526' }}
            >
                다시 시도하기
            </button>
        </article>
    );
};