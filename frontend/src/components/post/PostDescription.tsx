//Post (게시물작성, 우측 상단): 텍스트 입력 및 글자 수 카운트
import { useEffect, useRef, type ChangeEvent, type Dispatch, type SetStateAction } from 'react';

interface PostDescriptionProps{
    content: string;
    setContent: Dispatch<SetStateAction<string>>;
}

const PostDescription = ({content, setContent}: PostDescriptionProps) => {

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if(textareaRef.current){
            textareaRef.current.style.height = 'auto';

            const maxHeight = 500;
            const nextHeight = textareaRef.current.scrollHeight;

            if(nextHeight > maxHeight){
                textareaRef.current.style.height = `${maxHeight}px`;
                textareaRef.current.style.overflowY = 'auto';
            }else{
                textareaRef.current.style.height = `${nextHeight}px`;
                textareaRef.current.style.overflowY = 'hidden';
            }
        }
    }, [content]);

    //[텍스트 변경 시 메서드]
    const handleTextChange = (e:ChangeEvent<HTMLTextAreaElement>) => {
        const inputText = e.target.value;

        //500자 넘어가면 500자까지 자르기(한글 대비)
        if(inputText.length > 500){
            setContent(inputText.slice(0, 500));
        }else{
            setContent(inputText);
        }
    };

    return(
        <div style={{ marginBottom: '0.7rem' }}>
            {/* 상단 글자 수 카운터 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                <div style={{ margin: 0 }}>글 작성</div>
                <span style={{ fontSize: '0.875rem', color: content.length === 500 ? 'red' : '#6b7280' }}>
                    ({content.length} / 500)
                </span>
            </div>

            {/* 하단 입력창 */}
            <textarea 
                placeholder="어떤 일이 있었나요?" 
                ref={textareaRef}
                rows={6}
                style={{ resize: 'none', minHeight: '150px', width: '100%' }}
                value={content}
                onChange={handleTextChange}//타이핑 할때마다 업데이트
                maxLength={500}
            >
            </textarea>
        </div>
    );
};

export default PostDescription;