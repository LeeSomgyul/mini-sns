import { usePostLikeMutation } from "../../post/hooks/usePostLikeMutation";

interface LikeButtonProps {
    postId: number;
    likeCount: number;
    isLiked: boolean;
}

export const LikeButton = ({postId, likeCount, isLiked}: LikeButtonProps) => {

    // mutate 함수: usePostLikeMutation의 onMutate와 mutationFn를 차례대로 실행하는 함수
    // isPending: 서버에 요청을 보내고 응답을 기다리는 중인가? (boolean)
    const {mutate, isPending} = usePostLikeMutation();

    // [메서드] 좋아요 클릭 시 실행
    const handleLikeToggle = () => {
        // 이미 서버에 좋아요 요청 중이면 연속 클릭 무시
        if(isPending) return;

        // usePostLikeMutation의 onMutate와 mutationFn 실행
        mutate({postId, isCurrentlyLiked: isLiked})
    };

    return(
        <button
            onClick={handleLikeToggle}
            disabled={isPending} // API 요청 중 버튼 비활성화
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-[#8b8b92] hover:bg-[#f4f4f6] transition-colors ${isPending ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
        >
            {isLiked ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 text-[#E64D4C]">
                    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-5 text-black/50">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
            )} {likeCount}
        </button>
    );
};