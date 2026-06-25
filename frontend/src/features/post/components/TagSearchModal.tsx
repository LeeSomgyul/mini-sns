import { createPortal } from "react-dom";
import type { TagUserType } from "../types/TagUserType";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { useDebounce } from "../../../common/hook/useDebounce";
import type { UserInfo } from "../../search/types/userSearchType";
import { useUserSearchQuery } from "../../search/hooks/useUserSearchQuery";


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

    const {
        data: searchResponse,
        isLoading, 
        fetchNextPage,  //다음 페이지를 불러오는 함수
        hasNextPage,    //다음 페이지 존재 여부
        isFetchingNextPage//다음 페이지를 가져오는 중인지 상태
    } = useUserSearchQuery(debouncedKeyword, 'friends');

    // 1. 무한스크롤
    // 1-1. 바닥 감지 센서
    const bottomSensorRef = useRef<HTMLDivElement | null>(null);

    // 1-2. 센서가 화면에 보이면 자동으로 다음 페이지 호출
    useEffect(() => {
        // 더 가져올 데이터가 없거나, 이미 로딩 중이면 센서 감지 X
        if(!hasNextPage || isFetchingNextPage) return;

        // 관찰
        const observer = new IntersectionObserver(
            (entries) => {
                if(entries[0].isIntersecting){
                    fetchNextPage();
                }
            },
            {threshold: 0.1}
        );

        const currentSensor = bottomSensorRef.current;

        if(currentSensor){
            observer.observe(currentSensor);
        }

        // 모달이 닫히거나 검색어가 바뀌면 관찰 해제
        return () => {
            if(currentSensor){
                observer.unobserve(currentSensor);
            }
        }
    },[hasNextPage, isFetchingNextPage, fetchNextPage, debouncedKeyword]);

    //위 검색 api에서 UserInfo(userId, name, nickname, profileImageUrl)만 추출
    const searchResults: UserInfo[] = searchResponse?.pages.flatMap(page => page.content) || [];

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
                        <>
                            {searchResults.map((user) => {

                                //방금 선택한 태그 유저가 이미 선택된 유저인지 확인
                                const isSelected = tagList.some(tag => tag.userId === user.userId);

                                //[체크박스 클릭 핸들러]
                                const handleToggleUser = () => {
                                    if(isSelected){
                                        //이미 선택되어 있으면 태그 배열에서 제거
                                        setTagList(tagList.filter(tag => tag.userId !== user.userId));
                                    }else{
                                        //기존에 선택 안되어있는데, 현재 10명 미만으로 선택되어져 있다면 태그 인원에 추가
                                        if(tagList.length >= 10){
                                            toast.error("태그는 최대 10명까지만 가능합니다.");
                                            return;
                                        }

                                        setTagList([...tagList, {
                                            userId: user.userId,
                                            name: user.name,
                                            nickname: user.nickname,
                                            profileImageUrl: user.profileImageUrl
                                        }]);
                                    }
                                };
                                
                                return(
                                    <article
                                        key={user.userId}
                                        onClick={handleToggleUser}
                                        style={{ 
                                            padding: '0.5rem', marginBottom: '0.5rem', display: 'flex', 
                                            justifyContent: 'space-between', alignItems: 'center', 
                                            backgroundColor: isSelected ? '#eff6ff' : 'white', 
                                            borderRadius: '8px', border: '1px solid #e5e7eb',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {/* 프로필, 닉네임, 이름 */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <img
                                                src={user.profileImageUrl || DEFAULT_PROFILE}
                                                alt={`${user.nickname} 프로필`} 
                                                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                                            />
                                            <span style={{ fontWeight: 'bold' }}>{user.nickname}</span>
                                            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{user.name}</span>
                                        </div>
                                        
                                        {/* 체크박스 */}
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            readOnly
                                            style={{ margin: 0, pointerEvents: 'none' }}
                                        />
                                    </article>
                                );
                            })}

                            {/* 무한스크롤 */}
                            <div 
                                ref={bottomSensorRef}
                                style={{ height: '20px', margin: '1rem 0', display: 'flex', justifyContent: 'center' }}
                            >
                                {/* 더 불러올 친구가 있는 경우 */}
                                {isFetchingNextPage && (
                                    <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                                        🔄 친구를 더 불러오는 중입니다...
                                    </div>
                                )}

                                {/* 더 이상 불러올 친구가 없는 경우 */}
                                {!hasNextPage && searchResults.length > 0 && (
                                    <div style={{ color: '#d1d5db', fontSize: '0.875rem' }}>
                                        마지막 사용자입니다.
                                    </div>
                                )}
                            </div>                            
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};