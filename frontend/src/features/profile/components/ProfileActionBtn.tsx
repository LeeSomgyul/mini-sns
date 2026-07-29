import { useFollowMutation } from "../hooks/useFollowMutation";
import { useUnfollowMutation } from "../hooks/useUnfollowMutation";

// [부모인 ProfileHeader > ProfilePage 에서 상속]
interface ProfileActionBtnProps{
    targetUserId: number;
    isMe: boolean;
    isFollowing: boolean;
    onOpenPrivacyInfoModal: () => void;
}

// [프로필 상단 버튼 분기]
// - 내 프로필일 경우: 개인정보 수정 버튼
// - 상대방의 프로필일 경우: 팔로우 추가 & 팔로우 삭제
export const ProfileActionBtn = ({targetUserId, isMe, isFollowing, onOpenPrivacyInfoModal}: ProfileActionBtnProps) => {
    // 팔로우 & 언팔로우 훅 가져오기
    const {mutate: follow, isPending: isFollowPending} = useFollowMutation({
        onSuccess: () => {},
        onError: () => {}
    });
    const {mutate: unfollow, isPending: isUnfollowPending} = useUnfollowMutation({
        onSuccess: () => {},
        onError: () => {}
    });

    // 1. 내 프로필일 경우: '개인정보 수정' 버튼 반환
    if(isMe){
        return(
            <button
                className="w-full h-11 rounded-xl bg-black text-white text-sm font-semibold cursor-pointer hover:bg-black/85 transition-colors"
                onClick={onOpenPrivacyInfoModal}
            >
                개인정보 수정
            </button>
        );
    }

    // 2. 상대방 프로필 & 이미 팔로우 중일 경우: '팔로우 삭제' 버튼 반환
    if(isFollowing){
        return(
            <button
                className="w-full h-11 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUnfollowPending}
                onClick={() => unfollow({targetUserId: targetUserId})}
            >
                팔로우 취소
            </button>
        );
    }

    // 3. 상대방 프로필 & 팔로우 안되어 있는 경우: '팔로우 요청' 버튼 반환
    return(
        <button
            className="w-full h-11 rounded-xl bg-[#5cc8f1] text-white text-sm font-semibold cursor-pointer hover:bg-[#49b8e3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isFollowPending}
            onClick={() => follow({targetUserId: targetUserId})}
        >
            팔로우 요청
        </button>
    );
};
