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
            {isLiked ? '❤️' : '🤍'} {likeCount}
        </button>
    );
};