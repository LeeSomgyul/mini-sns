import { useEffect, useRef } from 'react';
import {userSearchApi} from "../../api/userSearchApi";

interface SearchResultProps {
    keyword: string;
}

//[자식 컴포넌트] 결과창 UI
//keyword: 사용자가 최종적으로 입력한 값
export const SearchResult = ({keyword}: SearchResultProps) => {

    const DEFAULT_PROFILE = `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image.png`;

    //data: 실제 화면에 보일 데이터
    //isLoading: api에서 response로 가져오는중 여부
    //isError: 에러 발생 여부
    //isFetchingNextPage: 페이지 가져오는 중인지 아닌지 여부
    //hasNextPage: 다음 페이지 존재 여부
    //fetchNextPage: 다음 페이지 데이터 가져오는 함수
    //refetch: 새로고침 등 이유로 데이터 다시 가져오기 함수
    const {data, isLoading, isError, isFetchingNextPage, hasNextPage, fetchNextPage, refetch} = userSearchApi(keyword);
    const observerRef = useRef<HTMLDivElement>(null);

    //[무한 스크롤 감지]
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                //리스트 최하단 도달 시 다음 페이지 요청
                if(entries[0].isIntersecting && hasNextPage && !isFetchingNextPage){
                    fetchNextPage();
                }
            },
            //바닥에 닿기 200px 전에 미리 데이터 가져오기
            {rootMargin: '200px'}
        );

        //이후에 다음페이지 있는지 감시
        if(observerRef.current) observer.observe(observerRef.current);

        //페이지 감시 제거(클린업)
        return () => observer.disconnect();
    },[hasNextPage, isFetchingNextPage, fetchNextPage]);

    //초기 안내 메시지
    if(!keyword){
        return(
            <article>
                <p style={{ textAlign: 'center', color: 'gray' }}>
                    사용자의 이름이나 닉네임을 입력해주세요.
                </p>
            </article>
        );
    }

    //로딩 인디케이터
    if(isLoading){
        return(
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <button aria-busy="true" className="secondary" disabled>검색 중...</button>
            </div>
        );
    }

    //에러 발생 시 재시도 UI
    if(isError){
        return(
            <article className="error">
                <p>검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
                <button onClick={() => refetch()}>재시도</button>
            </article>
        );
    }

    //검색결과 사용자 정보 가져오기
    const users = data?.pages?.flatMap((page) => {
        if(!page || !page.content){
            return [];
        }
        return page.content;
    }) || [];

    //검색 결과 없을 시
    if(users.length === 0){
        return(
            <article>
                <p style={{ textAlign: 'center' }}>검색 결과가 없습니다.</p>
            </article>
        );
    }

    //검색 결과 있을 시 리스트 렌더링
    return(
        <section>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {users.map((user) => {
                    if(!user) return null;
                    return(
                        <div
                            key={user.userId}
                            style={{ display: 'flex', alignItems: 'center', padding: '0.5rem', cursor: 'pointer', borderBottom: '1px solid var(--pico-muted-border-color)' }}
                            onClick={() => console.log(`${user.userId}번 프로필로 이동`)}//🚨🚨프로필 구현 후 연결🚨🚨
                        >
                            {/* 프로필 이미지 */}
                            <div style={{ width: '50px', height: '50px', marginRight: '1rem' }}>
                                <img
                                    src={user.profileImageUrl || DEFAULT_PROFILE}
                                    alt={user.nickname}
                                    style={{ borderRadius: '50%', objectFit: 'cover', width: '100%', height: '100%' }}
                                />
                            </div>
                            {/* 닉네임, 이름 */}
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <strong style={{ fontSize: '1rem' }}>{user.nickname}</strong>
                                <small style={{ color: 'var(--pico-muted-color)' }}>{user.name}</small>
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* 무한 스크롤 + 로딩 UI */}
            <div ref={observerRef} style={{ height: '40px', marginTop: '1rem', textAlign: 'center' }}>
                {isFetchingNextPage && <span aria-busy="true">불러오는 중...</span>}
            </div>
        </section>
    );
};