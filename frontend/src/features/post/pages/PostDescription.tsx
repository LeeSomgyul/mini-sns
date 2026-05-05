import { useFormContext } from 'react-hook-form';
import { useAutoResize } from '../hooks/useAutoResize';
import type { PostFormValues } from '../schemas/postSchema';

export default function PostDescription() {
    // React Hook Form 연동
    const { register, watch } = useFormContext<PostFormValues>();
    
    // 사용자가 입력하는 실시간 입력 감시 (이름을 content로 붙임)
    const content = watch('content') || ''; 

    // useDescriptionMutation 사용해서 글자수에 따른 입력창 높이 받아오기 
    const autoResizeRef = useAutoResize(content, 500);

    // ref: HTML 요소 연결 (textarea)
    // onChange: textarea에서 사용자가 입력값 바꿀때마다 값 저장하는 함수
    // rest: register에서 제공하는 나머지 함수들 
    const { ref: rhfRef, onChange: rhfOnChange, ...rest } = register('content');

    return (
        <div style={{ marginBottom: '0.7rem' }}>
            {/* 상단 글자 수 카운터 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                <div style={{ margin: 0 }}>글 작성</div>
                <span style={{ fontSize: '0.875rem', color: content.length >= 500 ? 'red' : '#6b7280' }}>
                    ({content.length} / 500)
                </span>
            </div>

            {/* 하단 입력창 */}
            <textarea 
                placeholder="어떤 일이 있었나요?" 
                rows={6}
                maxLength={500} 
                style={{ resize: 'none', minHeight: '150px', width: '100%' }}
                
                {...rest} 
                
                ref={(node) => {
                    rhfRef(node); 
                    autoResizeRef.current = node; 
                }}
                
                onChange={(e) => {
                    const val = e.target.value;
                    if (val.length > 500) {
                        e.target.value = val.slice(0, 500);
                    }
                    rhfOnChange(e);
                }}
            />
        </div>
    );
}