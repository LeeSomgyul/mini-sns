//[컴포넌트] 게시물이 없을 경우 화면
export const FeedEmpty = () => {
    return(
        <article className="flex flex-col items-center justify-center gap-3 mt-6 h-[750px] rounded-3xl border border-white/60 bg-white/90 backdrop-blur-xl shadow-[0_12px_32px_rgba(30,30,45,0.07)] p-5">
            <div className="text-5xl">👋</div>
            <h3 className="m-0 text-lg font-semibold text-[#2b2b31]">아직 피드가 비어있네요!</h3>
            <p className="m-0 text-sm text-[#8b8b92]">
                새로운 친구를 찾아 팔로우하세요!
            </p>
        </article>
    );
};