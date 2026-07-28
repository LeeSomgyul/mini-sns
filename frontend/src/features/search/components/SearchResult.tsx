import { useUserSearchQuery } from '../hooks/useUserSearchQuery';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';

interface SearchResultProps {
    keyword: string;
}

export const SearchResult = ({ keyword }: SearchResultProps) => {
    const MINIO_MEDIA_ENDPOINT = `${import.meta.env.VITE_MINIO_MEDIA_ENDPOINT}/`;
    const DEFAULT_PROFILE = `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image.png`;

    const {
        data,//실제 화면에 보일 데이터
        isLoading,//api에서 response로 가져오는중 여부
        isError,//에러 발생 여부
        isFetchingNextPage,//다음 페이지 가져오는 중인지 여부
        hasNextPage,//다음 페이지 존재 여부
        fetchNextPage,//다음 페이지 가져오는 함수
        refetch//새로고침 등 이유로 데이터 다시 가져오기 
    } = useUserSearchQuery(keyword);

    const observerRef = useInfiniteScroll({
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
        rootMargin: '200px'
    });

    const navigate = useNavigate();


    if (!keyword) {
        return (
            <div>
                <p className="text-center text-sm text-[#a7a7ae]">
                    사용자의 이름이나 닉네임을 입력해주세요.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <button aria-busy="true" disabled className="text-sm text-[#a7a7ae] bg-transparent border-0">검색 중...</button>
            </div>
        );
    }

    if (isError) {
        return (
            <article className="text-center py-8">
                <p className="text-sm text-[#d93526]">검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
                <button
                    onClick={() => refetch()}
                    className="mt-2 px-4 py-1.5 rounded-full bg-[#f4f4f6] text-sm text-[#7a7a82] cursor-pointer hover:bg-[#eaeaed] transition-colors"
                >
                    재시도
                </button>
            </article>
        );
    }

    const users = data?.pages?.flatMap((page) => page?.content || []) || [];

    if (users.length === 0) {
        return (
            <article>
                <p className="text-center text-sm text-[#a7a7ae]">검색 결과가 없습니다.</p>
            </article>
        );
    }

    return (
        <section>
            <div className="flex flex-col gap-3">
                {users.map((user) => {
                    if (!user) return null;
                    const finalImage = MINIO_MEDIA_ENDPOINT + user.profileImageUrl;
                    return (
                        <div
                            key={user.userId}
                            className="flex items-center gap-3 cursor-pointer rounded-2xl px-2 py-2 hover:bg-[#f4f4f6] transition-colors"
                            onClick={() => navigate(ROUTES.PROFILE.LINK(user.userId))}
                        >
                            <img
                                src={finalImage || DEFAULT_PROFILE}
                                onError={(e) => { e.currentTarget.src = DEFAULT_PROFILE; }}
                                alt={user.nickname}
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="flex flex-col">
                                <strong className="text-sm font-semibold text-[#3a3a41]">{user.nickname}</strong>
                                <small className="text-xs text-[#a7a7ae]">{user.name}</small>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div ref={observerRef} className="h-10 mt-4 text-center">
                {isFetchingNextPage && <span aria-busy="true" className="text-xs text-[#a7a7ae]">불러오는 중...</span>}
            </div>
        </section>
    );
};