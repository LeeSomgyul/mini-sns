import { SearchTotalSpace } from "../components/userSearch/SearchTotalSpace";

//[홈] 피드 + 사용자 검색(userSearch)
const FeedPage = () => {
    return(
        <main className="container" style={{ display: 'flex', height: '100vh', gap: '2rem', padding: '1rem' }}>
            {/* 왼쪽: 피드 영역 */}
            <section style={{ flex: 2, overflowY: 'auto', paddingRight: '1rem' }}>
                {/* 🚨🚨피드 화면 위치 예정🚨🚨 */}
                <article>
                    <h2>타임라인</h2>
                    <p>여기에 게시물(피드)들이 렌더링될 예정입니다.</p>
                </article>
            </section>

            {/* 오른쪽: 사용자 검색 영역 */}
            <aside style={{ flex: 1, minWidth: '300px', height: '100%' }}>
                <SearchTotalSpace/>
            </aside>
        </main>
    );
};

export default FeedPage;