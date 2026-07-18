import type { FollowContentDto } from "../types/FollowType";
import { useFollowMutation } from "../hooks/useFollowMutation";
import { useUnfollowMutation } from "../hooks/useUnfollowMutation";

interface FollowListItemProps{
    user: FollowContentDto;
    type: 'followings' | 'followers';
    isCurrentlyUnfollowed: boolean;
    // targetId: 팔로우 & 언팔로우 리스트 대상
    // shouldAdd: 언팔로우 리스트에 추가 여부
    onToggleUnfollow: (targetId: number, shouldAdd: boolean) => void;
}

export const FollowListItem = ({user, type, isCurrentlyUnfollowed, onToggleUnfollow}: FollowListItemProps) => {

    const MINIO_MEDIA_ENDPOINT = `${import.meta.env.VITE_MINIO_MEDIA_ENDPOINT}/`;
    const DEFAULT_PROFILE = `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image.png`;

    const finalImage = user.profileImageUrl !== null
        ? MINIO_MEDIA_ENDPOINT+user.profileImageUrl
        : DEFAULT_PROFILE;

    const {mutate: follow} = useFollowMutation({
        isModalOpen: true,
        onSuccess: (_data, variables) => {
            const targetUserId = variables.targetUserId;
            onToggleUnfollow(targetUserId, false);
        },
        onError: () => {}
    });
    const {mutate: unfollow} = useUnfollowMutation({
        isModalOpen: true,
        onSuccess: (_data, variables) => {
            const targetUserId = variables.targetUserId;
            onToggleUnfollow(targetUserId, true);
        },
        onError: () => {}
    });

    return(
    <li 
        key={user.userId} 
        style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid var(--pico-border-color)' }}
    >
        {/* 프로필 이미지 */}
        <img
            src={finalImage} 
            alt={`${user.nickname} 프로필 이미지`}
            style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }}
        />

        {/* 닉네임, 이름 */}
        <div style={{ flex: 1 }}>
            <strong style={{ display: 'block', fontSize: '1rem' }}>{user.nickname}</strong>
            <small style={{ color: 'var(--pico-muted-color)', fontSize: '0.85rem' }}>{user.name}</small>
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
                className={isCurrentlyUnfollowed ? "" : "outline"}
                style={{ width: 'auto', margin: 0, padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
            >
                {isCurrentlyUnfollowed ? "팔로우" : "팔로우 취소"}
            </button>
        )}
    </li>
    );
};