import { useState } from 'react';
import type { UserProfileResponse } from '../types/UserProfileType';
import { formatCount } from '../util/formatCount';
import { UserPrivacyInfoUpdateModal } from './UserPrivacyInfoUpdateModal';
import { ProfileActionBtn } from './ProfileActionBtn';
import { FollowListModal } from './FollowListModal';
import { useQueryClient } from '@tanstack/react-query';
import { FOLLOW_KEYS } from '../../../constants/queryKey';
import { useAuthStore } from '../../auth/store/authStore';

interface ProfileHeaderProps {
  userData: UserProfileResponse;
  postCount: number;
}

// [프로필 우측 상단] 유저 정보 및 액션 버튼
export const ProfileHeader = ({ userData, postCount }: ProfileHeaderProps) => {
  const MINIO_MEDIA_ENDPOINT = `${import.meta.env.VITE_MINIO_MEDIA_ENDPOINT}/`;
  const DEFAULT_PROFILE = `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image.png`;
  const finalImage = userData.profileImageUrl !== null
      ? MINIO_MEDIA_ENDPOINT + userData.profileImageUrl
      : DEFAULT_PROFILE;

  console.log(finalImage);

  const queryClient = useQueryClient();

  const myUserId = useAuthStore((state) => state.myUserId);

  // [상태]
  // 1. 개인정보 수정 모달 열림 여부 관리
  const [ isPrivacyInfoModalOpen, setPrivacyInfoModalOpen] = useState(false);

  // 2. 팔로워 및 팔로잉 리스트 모달 상태
  const [ isFollowListModalOpen, setIsFollowListModalOpen ] = useState(false);
  const [ modalType, setModalType ] = useState<'followings'|'followers'>('followings');

  // [핸들러]
  // 1. '팔로워' 목록 클릭 시
  const handleOpenFollowers = () => {
    setModalType('followers');
    setIsFollowListModalOpen(true);
  }

  // 2. '팔로잉' 목록 클릭 시
  const handleOpenFollowings = () => {
    setModalType('followings');
    setIsFollowListModalOpen(true);
  }

  // 3. '팔로워' & '팔로잉' 목록 닫을 때
  const handleCloseModal = () => {
    if(myUserId){
      queryClient.invalidateQueries({queryKey: FOLLOW_KEYS.followings(myUserId)});
    }
    setIsFollowListModalOpen(false);
  }
  

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* [헤더] 닉네임 */}
      <h3 className="m-0 mb-2 text-xl font-bold text-[#2b2b31]">{userData.nickname}</h3>

      {/* [중간] 좌측 프로필 이미지 / 우측 게시물 및 팔로워 팔로잉 수 영역 */}
      <div className="flex items-center gap-6">

        {/* 프로필 이미지 */}
        <div className="w-25 h-25 rounded-full bg-gray-100 overflow-hidden shrink-0 border border-black/10">
          <img
            src={finalImage}
            alt={`${userData.nickname} 프로필 이미지`}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = DEFAULT_PROFILE; }}
          />
        </div>

        <div className="flex flex-1 justify-start gap-8 text-center">
          {/* 게시물 수 */}
          <div>
            <span className="block text-lg text-[#a8a8a8]">게시물</span>
            <strong className="text-xl font-bold text-[#2b2b31]">{formatCount(postCount)}</strong>
          </div>

          {/* 팔로워 수 & 클릭 */}
          <div onClick={handleOpenFollowers} className="cursor-pointer hover:opacity-70 transition-opacity">
            <span className="block text-lg text-[#a8a8a8]">팔로워</span>
            <strong className="text-xl font-bold text-[#2b2b31]">{formatCount(userData.followerCount)}</strong>
          </div>

          {/* 팔로잉 수 & 클릭 */}
          <div onClick={handleOpenFollowings} className="cursor-pointer hover:opacity-70 transition-opacity">
            <span className="block text-lg text-[#a8a8a8]">팔로잉</span>
            <strong className="text-xl font-bold text-[#2b2b31]">{formatCount(userData.followingCount)}</strong>
          </div>
        </div>
      </div>

      {/* 함께 아는 친구 */}
      {!userData.isMe && userData.mutualFollowerCount > 0 && (
        <p className="m-0 -mt-1 text-xs text-[#a7a7ae]">
          {userData.mutualFollowerCount === 1 ? (
            // 함께 아는 친구가 1명일 때
            `${userData.representativeMutualNickname}님과 함께 아는 친구입니다.`
          ) : (
            // 함께 아는 친구가 2명 이상일 때
            `${userData.representativeMutualNickname}님 외 ${userData.mutualFollowerCount - 1}명과 함께 아는 친구`
          )}
        </p>
      )}

      {/* [하단] 개인정보 수정 & 팔로우 요청 & 팔로우 취소 버튼 */}
      <ProfileActionBtn
        targetUserId={userData.userId}
        isMe={userData.isMe}
        isFollowing={userData.isFollowing}
        onOpenPrivacyInfoModal={() => setPrivacyInfoModalOpen(true)}
      />

      {/* [모달] 개인정보 변경 모달 영역 */}
      <UserPrivacyInfoUpdateModal
        isOpen={isPrivacyInfoModalOpen}
        onClose={() => setPrivacyInfoModalOpen(false)}
      />

      {/* [모달] 팔로잉 & 팔로우 모달 영역 */}
      {isFollowListModalOpen && (
        <FollowListModal
          type={modalType}
          userId={userData.userId}
          onClose={handleCloseModal}
        />
      )}

    </div>
  );
};