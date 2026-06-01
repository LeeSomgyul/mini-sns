interface FeedActionsProps{
    likeCount?: number;
    commentCount?: number;
}

//[컴포넌트] 피드 카드의 좋아요/댓글/태그 공간
//@param FeedActionsProps: 백엔드에서 가져온 게시물의 좋아요 및 댓글 개수
//🚨좋아요, 댓글, 태그기능 완료 후 수정하기🚨
export const FeedActions = ({likeCount=0, commentCount=0}: FeedActionsProps) => {
    return(
        <footer style={{ display: 'flex', gap: '1rem', padding: '0.5rem 0', borderTop: '1px solid var(--pico-table-border-color)' }}>
            <button className="outline secondary" style={{ padding: '0.4rem 0.8rem' }}>
                ❤️ 좋아요 {likeCount}
            </button>
            <button className="outline secondary" style={{ padding: '0.4rem 0.8rem' }}>
                💬 댓글 {commentCount}
            </button>
            <button className="outline secondary" style={{ padding: '0.4rem 0.8rem' }}>
                🏷️ 태그
            </button>
        </footer>
    );
};