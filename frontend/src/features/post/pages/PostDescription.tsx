import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useAutoResize } from '../hooks/useAutoResize';
import type { PostFormValues } from '../schemas/postSchema';
import type React from 'react';

interface PostDescriptionProps{
    mode: 'create' | 'edit';
    disabled?: boolean;
}

export default function PostDescription({mode, disabled}: PostDescriptionProps) {

    const { control, formState:{isSubmitting} } = useFormContext<PostFormValues>();

    //현재 값 감지
    const watchedContent = useWatch({
        control,
        name: 'content',
        defaultValue:''
    });

    const autoResizeRef = useAutoResize(watchedContent, 500);

    // 초기 로딩중 or 저장 중일 시 textarea 잠금
    const isInputDisabled = disabled || isSubmitting;

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
                    <div className="flex flex-col h-full">
                        {/* 상단 글자 수 카운터 */}
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[13.5px] font-semibold text-[#1c1c21]">글 작성</span>
                            <span className={`text-xs ${value.length >= 500 ? 'text-red-500' : 'text-[#9a9aa3]'}`}>
                                ({value.length} / 500)
                            </span>
                        </div>

                        {/* 하단 입력창 */}
                        <textarea
                            placeholder="어떤 일이 있었나요?"
                            maxLength={500}
                            className="flex-1 min-h-[150px] w-full resize-none overflow-hidden rounded-2xl bg-white border border-black/10 px-4 py-3.5 text-[13.5px] text-[#3a3a41] outline-none focus:border-[#5cc8f1] disabled:opacity-60"
                            value={value}//사용자 실시간 입력값
                            onChange={handleTextChange}
                            ref={(node) => {
                                ref(node);
                                if(autoResizeRef){
                                    autoResizeRef.current = node;
                                }
                            }}
                            disabled = {isInputDisabled}
                        />
                </div>
                )
            }}
        />
    );
}