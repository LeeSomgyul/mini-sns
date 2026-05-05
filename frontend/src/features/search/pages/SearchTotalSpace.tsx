import {SearchInput} from '../components/SearchInput';
import {SearchResult} from '../components/SearchResult';
import { useSearchManager } from '../hooks/useSearchManager';

// [부모 컴포넌트] 입력창 SearchInput + 결과창 SearchResult
export const SearchTotalSpace = () => {

    const { 
        inputText, 
        setInputText, 
        searchKeyword, 
        handleKeyDown 
    } = useSearchManager(500);

    return (
        <article className="search-sidebar-container" style={{ height: '100%' }}>
            {/* 상단: 검색 바 */}
            <header className="sticky-search-header">
                <SearchInput
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </header>
            
            {/* 하단: 검색 결과 리스트 */}
            <div>
                <SearchResult
                    keyword={searchKeyword}
                />
            </div>
        </article>
    );
};