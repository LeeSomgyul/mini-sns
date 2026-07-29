import type { FollowContentDto } from "../types/FollowType";
import { useFollowMutation } from "../hooks/useFollowMutation";
import { useUnfollowMutation } from "../hooks/useUnfollowMutation";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants/routes";

interface FollowListItemProps{
    user: FollowContentDto;
    type: 'followings' | 'followers';
    isCurrentlyUnfollowed: boolean;
    // targetId: 팔로우 & 언팔로우 리스트 대상
    // shouldAdd: 언팔로우 리스트에 추가 여부
    onToggleUnfollow: (targetId: number, shouldAdd: boolean) => void;
    onCloseModal: () => void;
}

export const FollowListItem = ({user, type, isCurrentlyUnfollowed, onToggleUnfollow, onCloseModal}: FollowListItemProps) => {

    const MINIO_MEDIA_ENDPOINT = `${import.meta.env.VITE_MINIO_MEDIA_ENDPOINT}/`;
    const DEFAULT_PROFILE = `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image.png`;

    const finalImage = user.profileImageUrl !== null
        ? MINIO_MEDIA_ENDPOINT+user.profileImageUrl
        : DEFAULT_PROFILE;

    // [훅]
    // 1. 팔로우    
    const {mutate: follow} = useFollowMutation({
        isModalOpen: true,
        onSuccess: (_data, variables) => {
            const targetUserId = variables.targetUserId;
            onToggleUnfollow(targetUserId, false);
        },
        onError: () => {}
    });

    // 2. 언팔로우
    const {mutate: unfollow} = useUnfollowMutation({
        isModalOpen: true,
        onSuccess: (_data, variables) => {
            const targetUserId = variables.targetUserId;
            onToggleUnfollow(targetUserId, true);
        },
        onError: () => {}
    });

    // 3. 네비게이트
    const navigate = useNavigate();

    // [버튼] 프로필 리스트 클릭 시 해당 사용자의 프로필로 이동
    const handleProfileClick = () =>{
        if(onCloseModal) onCloseModal();
        navigate(ROUTES.PROFILE.LINK(user.userId));
    }

    return(
    <li
        key={user.userId}
        className="flex items-center gap-3 px-3 py-3 last:border-0 rounded-[10px] hover:bg-[#5cc8f1]/10"
    >
        <div
            onClick={handleProfileClick}
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
        >
            {/* 프로필 이미지 */}
            <img
                src={finalImage}
                alt={`${user.nickname} 프로필 이미지`}
                className="w-11 h-11 rounded-full object-cover shrink-0"
            />

            {/* 닉네임, 이름 */}
            <div className="min-w-0">
                <strong className="block text-sm font-semibold text-[#2b2b31] truncate">{user.nickname}</strong>
                <small className="block text-xs text-[#a7a7ae] truncate">{user.name}</small>
            </div>
        </div>

        {/* 내 팔로잉 목록을 볼 때만 팔로우 & 언팔로우 버튼 노출 */}
        {type === 'followings' && (
            <button
                onClick={() => {
                    if(isCurrentlyUnfollowed){
                        follow({targetUserId: user.userId});
                    }else{
                        unfollow({targetUserId: user.userId});
                    }
                }}
                className={
                    isCurrentlyUnfollowed
                        ? "shrink-0 h-8 w-22 px-3 rounded-lg bg-[#5cc8f1] hover:bg-[#49b8e3] text-white text-xs font-semibold cursor-pointer transition-colors"
                        : "shrink-0 h-8 w-22 px-3 rounded-lg border border-gray-200 text-gray-600 hover:text-[#E64D4C] hover:bg-gray-50 text-xs font-semibold cursor-pointer transition-colors"
                }
            >
                {isCurrentlyUnfollowed ? "팔로우" : "팔로우 취소"}
            </button>
        )}
    </li>
    );
};