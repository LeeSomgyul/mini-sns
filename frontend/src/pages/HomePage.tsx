import { useRef } from "react";
import { FeedPage } from "../features/feed/page/FeedPage";
import { SearchTotalSpace } from "../features/search/pages/SearchTotalSpace";

//[홈] 피드(feed) + 사용자 검색(userSearch)
export const HomePage = () => {

    //피드 스크롤 html 태그 관리
    const feedScrollRef = useRef<HTMLElement>(null);

    //[메서드] 피드 스크롤을 맨 위로 올리는 기능
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

            {/* 오른쪽: 사용자 검색 영역 */}
            <aside style={{ flex: 1, minWidth: '300px', height: '100%' }}>
                <SearchTotalSpace/>
            </aside>
        </main>
    );
};

export default HomePage;