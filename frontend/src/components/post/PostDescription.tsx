//Post (게시물작성, 우측 상단): 텍스트 입력 및 글자 수 카운트
import type { Dispatch, SetStateAction } from 'react';

interface PostDescriptionProps{
    content: string;
    setContent: Dispatch<SetStateAction<string>>;
}

const PostDescription = ({content, setContent}: PostDescriptionProps) => {
    return(
        <div style={{ marginBottom: '0.7rem' }}>
            <div style={{ marginBottom: '0.7rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0 }}>글 작성</h4>
                <small>({content.length} / 500)</small>
            </div>
            {/* Pico CSS 텍스트 박스 */}
            <textarea 
                placeholder="어떤 일이 있었나요?" 
                rows={6}
                style={{ resize: 'none' }}
                value={content}
                onChange={(e) => setContent(e.target.value)}//타이핑 할때마다 업데이트
                maxLength={500}>
            </textarea>
        </div>
        </div>
    );
};

export default PostDescription;