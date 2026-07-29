import { FeedCard } from "../../feed/components/FeedCard";
import { useFeedDetail } from "../../feed/hooks/useFeedDetail";

interface ProfileFeedDetailProps {
    postId: number | null;
    onDeleteSuccess?: () => void;
}

// 우측 게시물 썸네일 클릭 시 -> 게시물 단건 조회
export const ProfileFeedDetail = ({postId, onDeleteSuccess}: ProfileFeedDetailProps) => {

    const {
        data: post,
        isLoading, 
        isError
    } = useFeedDetail(postId);

    // 1. 작성된 게시물이 없을 경우
    if(!postId){
        return (
            <div className="flex flex-col items-center justify-center gap-3 mt-6 h-[750px] rounded-3xl border border-white/60 bg-white/90 backdrop-blur-xl shadow-[0_12px_32px_rgba(30,30,45,0.07)] p-5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10 text-gray-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                <p className="m-0 text-sm text-[#a7a7ae]">작성된 게시물이 없습니다.</p>
            </div>
        );
    }

    // 2. 게시물 데이터를 가져오고 있을 때
    if(isLoading){
        return(
            <div aria-busy="true" className="flex flex-col gap-3 h-[750px] rounded-3xl border border-white/60 bg-white/90 backdrop-blur-xl shadow-[0_12px_32px_rgba(30,30,45,0.07)] p-5 animate-pulse">
                {/* 프로필 이미지 + 닉네임/날짜 */}
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex flex-col gap-1.5">
                        <div className="h-3.5 w-24 rounded bg-gray-200" />
                        <div className="h-3 w-16 rounded bg-gray-200" />
                    </div>
                </div>

                {/* 미디어 영역 */}
                <div className="w-full aspect-square rounded-2xl bg-gray-200" />

                {/* 좋아요/댓글/태그 영역 */}
                <div className="flex items-center gap-3">
                    <div className="h-6 w-14 rounded-full bg-gray-200" />
                    <div className="h-6 w-14 rounded-full bg-gray-200" />
                    <div className="h-6 w-6 rounded-full bg-gray-200" />
                </div>

                {/* 본문 텍스트 영역 */}
                <div className="flex flex-col gap-1.5">
                    <div className="h-3.5 w-full rounded bg-gray-200" />
                    <div className="h-3.5 w-2/3 rounded bg-gray-200" />
                </div>
            </div>
        );
    }

    // 3. 에러 발생
    if(isError || !post){
        return(
            <div className="flex flex-col items-center justify-center gap-3 h-[750px] rounded-3xl border border-white/60 bg-white/90 backdrop-blur-xl shadow-[0_12px_32px_rgba(30,30,45,0.07)] p-5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10 text-red-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <p className="m-0 text-sm text-red-400">게시물을 불러올 수 없습니다.</p>
            </div>
        );
    }

    return(
        <div className="h-full gap-6 pt-6">
            <FeedCard
                post={post}
                onDeleteSuccess={onDeleteSuccess}
            />
        </div>
    );
};