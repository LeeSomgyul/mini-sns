import { useEffect, useState } from "react"
import { useDebounce } from "../../hook/useDebounce";
import { SearchInput } from "./SearchInput";
import { SearchResult } from "./SearchResult";

//[부모 컴포넌트] 입력창 SearchInput + 결과창 SearchResult
export const SearchTotalSpace = () => {

    const [inputText, setInputText] = useState('');//사용자의 매 순간 입력 값
    const [searchKeyword, setSearchKeyword] = useState('');//사용자의 최종 입력 값


    //디바운스 hook 적용
    const debouncedValue = useDebounce(inputText, 500);
    useEffect(() => {
        setSearchKeyword(debouncedValue.trim());
    },[debouncedValue]);

    //[메서드] enter 입력 시 0.5초 기다리지 않고 즉시 검색
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if(e.key === 'Enter'){
            e.preventDefault();
            setSearchKeyword(inputText.trim());
        }
    };
    
    return(
        <article className="search-sidebar-container"  style={{ height: '100%'}}>
            {/* 상단: 검색 바*/}
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
}