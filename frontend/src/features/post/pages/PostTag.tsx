import { useTagManager } from '../hooks/useTagManager';
import { useTagUserProfile } from '../hooks/useTagUserProfile';
import TagSearchModal from '../components/TagSearchModal';
import { useState } from 'react';
import type { TagUserProfileResponse } from '../types/TagUserType';

interface PostTagProps{
    mode: 'create' | 'edit';
    postId: number | undefined;
    disabled?: boolean;
}

export default function PostTag({mode, postId, disabled}: PostTagProps) {

    const DEFAULT_PROFILE = `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image.png`;

    // 커스텀 훅에서 상태와 메서드 가져오기
    const { tagUsers, handleAddTag, handleRemoveTag } = useTagManager();

    // 모달창 오픈 여부
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 로딩중 or 게시물 저장 중일 때 버튼 비활성화
    const isActionDisabled = disabled;

    // [게시물 수정] 현재 태그된 유저들의 userId만 배열로 생성
    // taggedUserIds: 태그 userId 리스트 추출 (예: [25, 30])
    const taggedUserIds = tagUsers.map((user) => user.userId);

    // [게시물 수정] 추출한 id 배열로 백엔드에 사용자 정보 요청
    // tagUserProfiles: id로 백엔드에서 찾아온 사용자 정보(이름, 닉네임, 프로필이미지url)
    // 예: { "userId": 11, "nickname": "gildong123", "name": "홍길동", "profileImageUrl": "hong.png" }
    const { data: tagUserProfiles } = useTagUserProfile(postId ?? 0, taggedUserIds, taggedUserIds.length > 0);

    // [게시물 수정] Map 형식으로 가공
    // 예: [11, { "userId": 11, "nickname": "gildong123", "name": "홍길동", "profileImageUrl": "hong.png" }]
    const profileMap = new Map<number, TagUserProfileResponse>(
        Array.isArray(tagUserProfiles)
        ? tagUserProfiles.map((profile) => [profile.userId, profile])
        : []
    );

    return (
        <div>
            {/* [모달] 태그 추가 */}
            {isModalOpen && (
                <TagSearchModal
                    isOpen={isModalOpen}
                    onCloseModal={() => setIsModalOpen(false)}
                    initialTags={tagUsers}
                    onComplete={(selectedUsers) => {
                        handleAddTag(selectedUsers);
                        setIsModalOpen(false);
                    }}
                />
            )}
            

            <h4 style={{ marginBottom: '0.5rem' }}>태그</h4>
            <button 
                type="button"
                className="secondary outline" 
                style={{ width: '100%', marginBottom: '0.7rem' }}
                onClick={() => !isActionDisabled && setIsModalOpen(true)}
                disabled={isActionDisabled}
            >
                태그 추가
            </button>
            
            {/* 태그된 유저 리스트 */}
            <div>
                {tagUsers.map((user) => {

                    const profile = profileMap.get(user.userId);
                    const nickname = profile?.nickname || user.nickname;
                    const name = profile?.name || user.name;
                    const profileImageUrl = profile?.profileImageUrl || user.profileImageUrl || DEFAULT_PROFILE;
                
                    return(
                        <article
                            key={user.userId}
                            style={{ padding: '0.5rem 1rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <img
                                    src={profileImageUrl}
                                    alt={`${user.nickname} 프로필`} 
                                    style={{ width: '32px', height: '32px', borderRadius: '50%'}}
                                />
                                <span style={{ fontWeight: 'bold' }}>{nickname}</span>
                                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{name}</span>
                            </div>
                            <button
                                type="button"
                                className="secondary outline" 
                                style={{ margin: 0, padding: '0.2rem 0.5rem', width: 'auto', fontSize: '0.8rem' }}
                                onClick={() => handleRemoveTag(user.userId)}   
                                disabled={isActionDisabled}
                            >
                                삭제
                            </button>
                        </article>
                    )
                })}
            </div>
        </div>
    );
}