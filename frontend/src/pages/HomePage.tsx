import { useRef} from "react";
import { FeedPage } from "../features/feed/page/FeedPage";
import { SearchTotalSpace } from "../features/search/pages/SearchTotalSpace";
import { FeedCommentSidebar } from "../features/feed/components/FeedCommentSidebar";
import { useCommentStore } from "../features/feed/store/useCommentStore";

//[홈] 피드(feed) + 사용자 검색(userSearch)
export const HomePage = () => {

    // [댓글 전역 상태 연결] postId, 댓글창 닫기
    const activePostId = useCommentStore((state) => state.activePostId);
    const closeCommentSide = useCommentStore((state) => state.closeCommentSide);

    // 피드 스크롤 html 태그 관리
    const feedScrollRef = useRef<HTMLElement>(null);

    // [메서드] 피드 스크롤을 맨 위로 올리는 기능
    const scrollToTap = () => {
        if(feedScrollRef.current){
            feedScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    return(
        <main className="container" style={{ display: 'flex', height: '100vh', gap: '2rem', padding: '1rem' }}>
            {/* 왼쪽: 피드 영역 */}
            <section 
                ref={feedScrollRef}
                style={{ flex: 2, overflowY: 'auto', paddingRight: '1rem' }}
            >
                <article>
                    <FeedPage onRefreshScroll={scrollToTap}/>
                </article>
            </section>

            {/* 오른쪽: 게시물 댓글 or 사용자 검색 영역 */}
            <aside style={{ flex: 1, minWidth: '300px', height: '100%' }}>
                {activePostId !== null ? (
                    <FeedCommentSidebar
                        postId={activePostId}
                        onClose = {closeCommentSide}
                    />
                ) : (
                    <SearchTotalSpace/>
                )}
            </aside>
        </main>
    );
};

export default HomePage;