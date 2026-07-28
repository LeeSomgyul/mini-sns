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
        <article className="flex flex-col h-full">
            {/* 상단: 검색 바 */}
            <header className="p-5 pb-3">
                <SearchInput
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </header>

            {/* 하단: 검색 결과 리스트 */}
            <div className="flex-1 overflow-y-auto p-5 pb-5">
                <SearchResult
                    keyword={searchKeyword}
                />
            </div>
        </article>
    );
};