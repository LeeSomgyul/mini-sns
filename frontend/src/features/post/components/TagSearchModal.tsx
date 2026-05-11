import { createPortal } from "react-dom";
import type { TagUserType } from "../types/TagUserType";
import { useEffect, useState } from "react";

import {userSearchApi} from "../../search/api/userSearchApi";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "../../../common/hook/useDebounce";
import type { UserInfo } from "../../search/types/userSearchType";

interface TagSearchModalProps{
    //모달창 오픈 여부
    isOpen: boolean;
    //부모(PostTag.tsx) 모달에게 선택 완료했다고 알려주며 selectedUsers(태그 리스트) 전달 
    onComplete: (selectedUsers: TagUserType[]) => void;
    //모달창 닫기
    onCloseModal: () => void;
    //모달 열릴때 가져오는 기존 태그 리스트
    initialTags: TagUserType[];
}

//[태그 검색] 모달
export default function TagSearchModal({isOpen, onComplete, onCloseModal, initialTags}: TagSearchModalProps){

    const DEFAULT_PROFILE = `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image.png`;

    const [tagList, setTagList] = useState<TagUserType[]>([]);//선택한 태그 리스트
    const [keyword, setKeyword] = useState('');//사용자가 실시간으로 검색하는 값
    const debouncedKeyword = useDebounce(keyword, 500);//디바운스 적용 후 검색되는 값

    //[🚨🚨임시 사용자 검색 api 연결🚨🚨]
    const {data: searchResponse, isLoading} = useQuery({
        queryKey: ['users', 'search', debouncedKeyword],
        queryFn: ({signal}) => 
            userSearchApi.searchUsers({
                keyword: debouncedKeyword,
                pageParam: 0,
                signal
            }),
        //검색어가 있을 때만(true) useQuery 실행
        enabled: !!debouncedKeyword.trim(),
    });

    //위 검색 api에서 UserInfo(userId, name, nickname, profileImageUrl)만 추출
    const searchResults: UserInfo[] = searchResponse?.content || [];

    //모달 창이 열릴때마다 부모의 기존 태그 리스트를 복사해오기
    useEffect(() => {
        if(isOpen){
            setTagList([...initialTags]);
            setKeyword('');
        }
    },[isOpen, initialTags]);

    if(!isOpen) return null;

    //[메서드] 모달창 닫기
    const handleCloseClick = () => {
        //기존 선택했던 태그 리스트와 새로 선택한 태그 리스트가 다른지 확인
        const isChanged = JSON.stringify(tagList) !== JSON.stringify(initialTags);

        if(isChanged){
            const isConfirmed = window.confirm("변경 사항이 저장되지 않았습니다. 정말 닫으시겠습니까?");
            //'예' 누르면 저장 안되고 모달창 닫기
            if(isConfirmed) onCloseModal();
        }else{
            //변경사항 없으면 바로 닫기
            onCloseModal();
        }
    }

    return createPortal(
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
            {/* 모달 하얀색 박스 */}
            <div style={{
                backgroundColor: 'white', width: '100%', maxWidth: '400px', height: '600px',
                borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}>
                {/* 1. 모달 헤더 */}
                <header style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.5rem', borderBottom: '1px solid #e5e7eb'
                }}>
                    <button
                        type="button"
                        onClick={() => onComplete(tagList)}//부모(PostTag.tsx)에게 전달
                        style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        완료
                    </button>
                    <h4 style={{ margin: 0}}>태그 추가</h4>
                    <button
                        type="button"
                        onClick={handleCloseClick}
                        style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer' }}
                    >
                        ❌
                    </button>
                </header>

                {/* 2. 검색창 영역 */}
                <div style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{gap: '0.5rem' }}>
                        <input
                            type="text"
                            placeholder="닉네임 또는 이름으로 검색하세요."
                            style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                        <div style={{ fontSize: '0.8rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                            (태그된 인원: {tagList.length} / 10)
                        </div>
                    </div>
                </div>

                {/* 3. 검색 결과 리스트 영역 */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', backgroundColor: '#f9fafb' }}>
                    {!debouncedKeyword.trim() ? (
                        <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '2rem' }}>
                            사용자를 검색해 보세요.
                        </div>
                    ) : isLoading ? (
                        <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '2rem' }}>
                            검색 중...
                        </div>
                    ) : searchResults.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '2rem' }}>
                            검색 결과가 없습니다.
                        </div>
                    ) : (
                        searchResults.map((user) => (
                            <article
                                key={user.userId}
                                style={{ padding: '0.5rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <img
                                        src={user.profileImageUrl || DEFAULT_PROFILE}
                                        alt={`${user.nickname} 프로필`} 
                                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                    <span style={{ fontWeight: 'bold' }}>{user.nickname}</span>
                                    <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{user.name}</span>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: '#3b82f6' }}>선택</span>
                            </article>
                        ))
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};