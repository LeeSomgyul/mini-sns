import { useRef} from "react";
import { FeedPage } from "../features/feed/page/FeedPage";
import { SearchTotalSpace } from "../features/search/pages/SearchTotalSpace";
import { FeedCommentSidebar } from "../features/feed/components/FeedCommentSidebar";
import { useCommentStore } from "../common/store/useCommentStore";

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
        <main className="flex justify-center items-start gap-7 h-[calc(100vh-4rem)]">
            {/* 왼쪽: 피드 영역 (내부 스크롤) */}
            <section
                ref={feedScrollRef}
                className="w-full max-w-[640px] h-full overflow-y-auto pb-10"
            >
                <FeedPage onRefreshScroll={scrollToTap}/>
            </section>

            {/* 오른쪽: 게시물 댓글 or 사용자 검색 영역 (내부 스크롤, 화면 높이에 맞춰 잘리지 않음) */}
            <aside className="hidden lg:block w-[400px] shrink-0 h-full py-6">
                <div className="h-full rounded-[20px] bg-white/90 backdrop-blur-xl border border-white/60 shadow-[0_10px_26px_rgba(30,30,45,0.06)] overflow-hidden">
                    {activePostId !== null ? (
                        <FeedCommentSidebar
                            postId={activePostId}
                            onClose = {closeCommentSide}
                        />
                    ) : (
                        <SearchTotalSpace/>
                    )}
                </div>
            </aside>
        </main>
    );
};

export default HomePage;
