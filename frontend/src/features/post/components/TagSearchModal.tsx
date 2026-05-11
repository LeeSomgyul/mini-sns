import { createPortal } from "react-dom";
import type { TagUserType } from "../types/TagUserType";
import { useEffect, useState } from "react";

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

    const [tagList, setTagList] = useState<TagUserType[]>([]);//선택한 태그 리스트

    //모달 창이 열릴때마다 부모의 기존 태그 리스트를 복사해오기
    useEffect(() => {
        if(isOpen){
            setTagList([...initialTags]);
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
                        />
                        <div style={{ fontSize: '0.8rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                            (태그된 인원: {tagList.length} / 10)
                        </div>
                    </div>
                </div>

                {/* 3. 검색 결과 리스트 영역 */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', backgroundColor: '#f9fafb' }}>
                    <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '2rem' }}>
                        사용자를 검색해 보세요.
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};