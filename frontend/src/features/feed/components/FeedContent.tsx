import { useEffect, useRef, useState } from "react";

//[컴포넌트] 피드 카드의 본문 텍스트
//@param content: 백엔드에서 가져온 피드 본문 텍스트
export const FeedContent = ({content}: {content: string}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isTextOverflowing, setIsTextOverflowing] = useState(false);
    const textRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const textElement = textRef.current;
        if(!textElement) return;

        const heightMonitoring = new ResizeObserver(() => {
            //scrollHeight: 텍스트 공간 실제 전체 높이
            //clientHeight: 화면에 보이는 텍스트 공간 높이 (화면 크기마다 다름)
            if(textElement.scrollHeight > textElement.clientHeight){
                setIsTextOverflowing(true);
            }else{
                setIsTextOverflowing(false);
            }
        });

        heightMonitoring.observe(textElement);
        return () => heightMonitoring.disconnect();
    },[content]);

    return(
        <div style={{ padding: '1rem 0' }}>
            <p 
                ref={textRef}
                style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    display: isExpanded ? 'block' : '-webkit-box',
                    WebkitLineClamp: isExpanded ? 'none' : 2, //'더보기' 접혀 있을때 2줄만 표시 
                    WebkitBoxOrient: 'vertical',
                    overflow: isExpanded ? "visible" : 'hidden',
                }}
            >
                {content}
            </p>

            {/* '더보기' 제공, 접기는 미제공 */}
            {isTextOverflowing && !isExpanded && (
                <button
                    style={{
                        border: 'none',
                        padding: 0,
                        background: 'none',
                        fontSize: '0.9rem',
                        color: 'var(--pico-muted-color)',
                        cursor: 'pointer',
                        marginTop: '4px',
                        display: 'block'
                    }}
                    onClick={() => setIsExpanded(true)}
                >
                    ...더보기
                </button>
            )}
        </div>
    );
}