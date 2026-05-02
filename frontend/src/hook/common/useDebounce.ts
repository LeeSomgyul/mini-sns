import { useEffect, useState } from "react";

//[공통 사용 가능] 0.5초 디바운스
//value: 사용자가 입력하는 순간의 값
//delay: 사용자가 입력하다가 얼마동안 멈추면 api 전송할 것인지 시간 (예: 0.5초)
//debounceValue: 0.5초 동안 사용자의 입력이 없으면 전달되는 api 요청
export function useDebounce<T>(value: T, delay: number): T{

    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    
    
    useEffect(() => {
        //0.5초 뒤에 값을 업데이트 하는 타이머
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        },delay);

        //0.5초 이내에 value가 바뀌면 이전 타이머 취소
        return() => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;    
}