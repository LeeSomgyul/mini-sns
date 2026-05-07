import { useState, useEffect } from 'react';
import { useDebounce } from '../../../common/hook/useDebounce';

export const useSearchManager = (debounceDelay: number = 500) => {
    const [inputText, setInputText] = useState(''); // 사용자의 매 순간 입력 값
    const [searchKeyword, setSearchKeyword] = useState(''); // API에 넘길 최종 입력 값

    // 디바운스 적용
    const debouncedValue = useDebounce(inputText, debounceDelay);

    useEffect(() => {
        setSearchKeyword(debouncedValue.trim());
    }, [debouncedValue]);

    // [enter 키 입력 시 디바운스 없이 바로 검색]
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setSearchKeyword(inputText.trim());
        }
    };

    return {
        inputText,
        setInputText,
        searchKeyword,
        handleKeyDown
    };
};