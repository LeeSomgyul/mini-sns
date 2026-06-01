import { FeedList } from "../features/feed/components/FeedList";
import { SearchTotalSpace } from "../features/search/pages/SearchTotalSpace";

//[홈] 피드(feed) + 사용자 검색(userSearch)
export const HomePage = () => {
    return(
        <main className="container" style={{ display: 'flex', height: '100vh', gap: '2rem', padding: '1rem' }}>
            {/* 왼쪽: 피드 영역 */}
            <section style={{ flex: 2, overflowY: 'auto', paddingRight: '1rem' }}>
                {/* 🚨🚨피드 화면 위치 예정🚨🚨 */}
                <article>
                    <FeedList/>
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