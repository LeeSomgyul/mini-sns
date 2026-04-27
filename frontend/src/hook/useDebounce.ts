import { useEffect, useState } from "react";

//[공통 사용 가능] 0.5초 디바운스
export function useDebounce<T>(value: T, delay: number): T{

    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    
    
    useEffect(() => {
        //0.5초 뒤에 값을 업데이트 하는 타이머
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        });

        //0.5초 이내에 value가 바뀌면 이전 타이머 취소
        return() => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;    
}