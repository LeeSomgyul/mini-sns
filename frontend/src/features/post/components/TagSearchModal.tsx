import { createPortal } from "react-dom";
import type { TagUserType } from "../types/TagUserType";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { useDebounce } from "../../../common/hook/useDebounce";
import type { UserInfo } from "../../search/types/userSearchType";
import { useTagUserSearchInfiniteQuery } from "../../search/hooks/useTagUserSearchInfiniteQuery";


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

    const MINIO_MEDIA_ENDPOINT = `${import.meta.env.VITE_MINIO_MEDIA_ENDPOINT}/`;
    const DEFAULT_PROFILE = `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image.png`;

    const [tagList, setTagList] = useState<TagUserType[]>([]);//선택한 태그 리스트
    const [keyword, setKeyword] = useState('');//사용자가 실시간으로 검색하는 값
    const debouncedKeyword = useDebounce(keyword, 500);//디바운스 적용 후 검색되는 값

    // [훅] 팔로잉 기반 사용자 검색
    const {
        data: searchResponse,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useTagUserSearchInfiniteQuery({
        keyword: debouncedKeyword,
        size: 10,
        enabled: debouncedKeyword.trim().length > 0 // 유저가 검색어를 입력했을 때만 api 실행
    });

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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            {/* 모달 하얀색 박스 */}
            <div className="w-full max-w-[400px] h-[600px] rounded-3xl bg-white/95 backdrop-blur-xl border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden">
                {/* 1. 모달 헤더 */}
                <header className="flex justify-between items-center px-4 py-2.5 border-b border-black/5">
                    <button
                        type="button"
                        onClick={() => onComplete(tagList)}//부모(PostTag.tsx)에게 전달
                        className="bg-transparent border-0 text-[#5cc8f1] font-bold cursor-pointer hover:text-[#49b8e3] transition-colors"
                    >
                        완료
                    </button>
                    <h4 className="m-0 text-base font-semibold text-[#2b2b31]">태그 추가</h4>
                    <button
                        type="button"
                        onClick={handleCloseClick}
                        className="bg-transparent border-0 text-base cursor-pointer"
                    >
                        ❌
                    </button>
                </header>

                {/* 2. 검색창 영역 */}
                <div className="px-4 py-3 border-b border-black/5">
                    <div className="flex flex-col gap-1.5">
                        <input
                            type="text"
                            placeholder="닉네임 또는 이름으로 검색하세요."
                            className="w-full rounded-xl border border-black/10 bg-[#f4f4f6] px-3 py-2 text-sm outline-none focus:border-[#5cc8f1]"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                        <div className="text-xs text-[#a7a7ae] whitespace-nowrap">
                            (태그된 인원: {tagList.length} / 10)
                        </div>
                    </div>
                </div>

                {/* 3. 검색 결과 리스트 영역 */}
                <div className="flex-1 overflow-y-auto p-4 bg-[#f9fafb]">
                    {!debouncedKeyword.trim() ? (
                        <div className="text-center text-[#a7a7ae] mt-8">
                            사용자를 검색해 보세요.
                        </div>
                    ) : isLoading ? (
                        <div className="text-center text-[#a7a7ae] mt-8">
                            검색 중...
                        </div>
                    ) : searchResults.length === 0 ? (
                        <div className="text-center text-[#a7a7ae] mt-8">
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

                                const finalImage = user.profileImageUrl !== null
                                    ? MINIO_MEDIA_ENDPOINT+user.profileImageUrl
                                    : DEFAULT_PROFILE;

                                return(
                                    <article
                                        key={user.userId}
                                        onClick={handleToggleUser}
                                        className={`flex justify-between items-center px-3 py-2 mb-2 rounded-xl border border-black/5 cursor-pointer transition-colors ${
                                            isSelected ? 'bg-[#eaf6fd]' : 'bg-white hover:bg-[#f4f4f6]'
                                        }`}
                                    >
                                        {/* 프로필, 닉네임, 이름 */}
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={finalImage}
                                                alt={`${user.nickname} 프로필`}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                            <span className="font-semibold text-[#2b2b31] text-sm">{user.nickname}</span>
                                            <span className="text-[#8b8b92] text-sm">{user.name}</span>
                                        </div>

                                        {/* 체크박스 */}
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            readOnly
                                            className="m-0 pointer-events-none accent-[#5cc8f1]"
                                        />
                                    </article>
                                );
                            })}

                            {/* 무한스크롤 */}
                            <div
                                ref={bottomSensorRef}
                                className="h-5 my-4 flex justify-center"
                            >
                                {/* 더 불러올 친구가 있는 경우 */}
                                {isFetchingNextPage && (
                                    <div className="text-[#a7a7ae] text-sm">
                                        🔄 친구를 더 불러오는 중입니다...
                                    </div>
                                )}

                                {/* 더 이상 불러올 친구가 없는 경우 */}
                                {!hasNextPage && searchResults.length > 0 && (
                                    <div className="text-[#d1d5db] text-sm">
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