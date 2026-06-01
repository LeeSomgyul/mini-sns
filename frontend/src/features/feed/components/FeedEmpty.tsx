//[컴포넌트] 게시물이 없을 경우 화면
export const FeedEmpty = () => {
    return(
        <article style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#f9f9f9' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👋</div>
            <h3>아직 피드가 비어있네요!</h3>
            <p style={{ color: '#666' }}>
                새로운 친구를 찾아 팔로우하세요!
            </p>
        </article>
    );
};