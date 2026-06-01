import { useState } from "react";

//[컴포넌트] 피드 카드의 본문 텍스트
//@param content: 백엔드에서 가져온 피드 본문 텍스트
export const FeedContent = ({content}: {content: string}) => {

    const [isExpanded, setIsExpanded] = useState(false);

    return(
        <div style={{ padding: '1rem 0' }}>
            <p style={{
                margin: 0,
                whiteSpace: 'pre-wrap',
                // '더보기'를 안 눌렀을 때만 2줄 말줄임 CSS 적용
                ...(!isExpanded && {
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                })
            }}>
                {content}
            </p>

            {/* '더보기' 제공, 접기는 미제공 */}
            {!isExpanded && (
                <button
                    style={{ border: 'none', padding: 0, background: 'none', fontSize: '0.9rem', color: 'var(--pico-muted-color)', cursor: 'pointer', marginTop: '4px' }}
                    onClick={() => setIsExpanded(true)}
                >
                    ...더보기
                </button>
            )}
        </div>
    );
}