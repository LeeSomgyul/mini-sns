import { useEffect, useRef } from 'react';

//[글자수에 따라 입력창 높이 자동 조절]
export const useAutoResize = (value: string, maxHeight: number = 500) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        const element = textareaRef.current;
        if (!element) return;

        // 높이 초기화 후 재계산 (글자를 지울 때도 textarea의 높이를 줄어들게 하기 위함)
        element.style.height = 'auto';
        const nextHeight = element.scrollHeight;

        if (nextHeight > maxHeight) {
            element.style.height = `${maxHeight}px`;
            element.style.overflowY = 'auto';
        } else {
            element.style.height = `${nextHeight}px`;
            element.style.overflowY = 'hidden';
        }
    }, [value, maxHeight]);

    return textareaRef;
};