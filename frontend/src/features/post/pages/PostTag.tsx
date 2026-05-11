import { useTagManager } from '../hooks/useTagManager';
import TagSearchModal from '../components/TagSearchModal';
import { useState } from 'react';

export default function PostTag() {

    // 커스텀 훅에서 상태와 메서드 가져오기
    const { tagUsers, handleAddTag, handleRemoveTag } = useTagManager();

    //모달창 오픈 여부
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div>
            {/* [모달] 태그 추가 */}
            <TagSearchModal
                isOpen={isModalOpen}
                onCloseModal={() => setIsModalOpen(false)}
                initialTags={tagUsers}
                onComplete={(selectedUsers) => {
                    console.log("모달에서 완료 누름! 선택된 유저들:", selectedUsers);
                    setIsModalOpen(false);
                }}
            />

            <h4 style={{ marginBottom: '0.5rem' }}>태그</h4>
            <button 
                type="button"
                className="secondary outline" 
                style={{ width: '100%', marginBottom: '0.7rem' }}
                onClick={() => setIsModalOpen(true)}
            >
                태그 추가
            </button>
            
            {/* 태그된 유저 리스트 */}
            <div>
                {tagUsers.map((user) => (
                    <article
                        key={user.userId}
                        style={{ padding: '0.5rem 1rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {/* 임시 유저 정보 (프로필 이미지, 닉네임, 이름) */}
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#d1d5db' }}></div>
                            <span style={{ fontWeight: 'bold' }}>{user.nickname}</span>
                            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{user.name}</span>
                        </div>
                        <button
                            type="button" // 폼 제출 방지 (필수)
                            className="secondary outline" 
                            style={{ margin: 0, padding: '0.2rem 0.5rem', width: 'auto', fontSize: '0.8rem' }}
                            onClick={() => handleRemoveTag(user.userId)}   
                        >
                            삭제
                        </button>
                    </article>
                ))}
            </div>
        </div>
    );
}