interface FeedErrorProps{
    message?: string;
    onRetry: () => void;
}

//[컴포넌트] 서버 응답 실패로 피드를 불러오지 못한 경우 화면
export const FeedError = ({message = "피드를 불러오지 못했습니다.", onRetry}: FeedErrorProps) => {
    return(
        <article className="mt-6 flex flex-col items-center gap-3 rounded-3xl border border-[#ffcccc] bg-white/90 backdrop-blur-xl p-12 text-center">
            <h4 className="m-0 text-base font-semibold text-[#d93526]">⚠️ 문제가 발생했습니다</h4>
            <p className="m-0 text-sm text-[#8b8b92]">{message}</p>
            <button
                onClick={onRetry}
                className="mt-1 px-4 py-2 rounded-full bg-[#d93526] text-white text-sm cursor-pointer hover:bg-[#c02e21] transition-colors"
            >
                다시 시도하기
            </button>
        </article>
    );
};