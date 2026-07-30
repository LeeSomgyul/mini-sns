import { useTagManager } from '../hooks/useTagManager';
import { useTagUserProfile } from '../hooks/useTagUserProfile';
import TagSearchModal from '../components/TagSearchModal';
import { useState } from 'react';
import type { TagUserProfileResponse } from '../types/TagUserType';
import { getProfileImageUrl } from '../../../common/utils/randomProfileImage';

interface PostTagProps{
    mode: 'create' | 'edit';
    postId: number | undefined;
    disabled?: boolean;
}

export default function PostTag({mode, postId, disabled}: PostTagProps) {

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
        <div className="flex flex-col gap-2.5 h-full">
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

            <span className="text-[13.5px] font-normal text-[#1c1c21]">태그</span>
            <button
                type="button"
                className="h-11 w-full rounded-xl bg-[#1c1c21] text-white text-[12.5px] cursor-pointer hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => !isActionDisabled && setIsModalOpen(true)}
                disabled={isActionDisabled}
            >
                태그 추가
            </button>

            {/* 태그된 유저 리스트 */}
            <div className="flex flex-col gap-2 overflow-y-auto overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-black/10">
                {tagUsers.map((user) => {

                    const profile = profileMap.get(user.userId);
                    const nickname = profile?.nickname || user.nickname;
                    const name = profile?.name || user.name;
                    
                    const profileImageUrl = getProfileImageUrl({
                        profileImageUrl: profile?.profileImageUrl,
                        userId: profile?.userId,
                    });

                    return(
                        <article
                            key={user.userId}
                            className="flex items-center gap-2 rounded-xl bg-white border border-black/50 px-2.5 py-2"
                        >
                            <img
                                src={profileImageUrl}
                                alt={`${user.nickname} 프로필`}
                                className="w-[26px] h-[26px] rounded-full object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0 text-[12.5px] truncate">
                                <span className="font-semibold text-[#474747]">{nickname}</span>
                                <span className="text-[#b8b8b8]"> {name}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveTag(user.userId)}
                                disabled={isActionDisabled}
                                className="flex items-center justify-center w-6 h-6 rounded-lg text-[#c2c2c8] hover:bg-black/5 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                            </button>
                        </article>
                    )
                })}
            </div>
        </div>
    );
}