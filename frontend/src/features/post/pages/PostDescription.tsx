import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useAutoResize } from '../hooks/useAutoResize';
import type { PostFormValues } from '../schemas/postSchema';
import type React from 'react';

export default function PostDescription() {

    const { control } = useFormContext<PostFormValues>();

    //현재 값 감지
    const watchedContent = useWatch({
        control,
        name: 'content',
        defaultValue:''
    });

    const autoResizeRef = useAutoResize(watchedContent, 500);

    return (
        <Controller
            name="content"
            control={control}
            defaultValue=""
            render={({ field: { onChange, value, ref } }) => {

                //한국어 입력 501자 입력 방지
                const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    const currentValue = e.target.value;
                    if(currentValue.length > 500){
                        onChange(currentValue.slice(0,500));
                    }else{
                        onChange(e);
                    }
                };

                return(
                    <div style={{ marginBottom: '0.7rem' }}>
                        {/* 상단 글자 수 카운터 */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                            <div style={{ margin: 0 }}>글 작성</div>
                            <span style={{ fontSize: '0.875rem', color: value.length >= 500 ? 'red' : '#6b7280' }}>
                                ({value.length} / 500)
                            </span>
                        </div>

                        {/* 하단 입력창 */}
                        <textarea 
                            placeholder="어떤 일이 있었나요?" 
                            maxLength={500} 
                            style={{ resize: 'none', minHeight: '150px', width: '100%', overflow: 'hidden'}}
                            value={value}//사용자 실시간 입력값
                            onChange={handleTextChange}
                            ref={(node) => {
                                ref(node);
                                if(autoResizeRef){
                                    autoResizeRef.current = node;
                                }
                            }}
                        />
                </div>
                )
            }}
        />
    );
}