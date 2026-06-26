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
        >

        </button>
    );
};