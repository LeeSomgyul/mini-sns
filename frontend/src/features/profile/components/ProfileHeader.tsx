import { useState } from 'react';
import type { UserProfileResponse } from '../types/UserProfileResponse';
import { formatCount } from '../util/formatCount';
import { UserPrivacyInfoUpdateModal } from './UserPrivacyInfoUpdateModal';

interface ProfileHeaderProps {
  userData: UserProfileResponse;
  postCount: number;
}

// [프로필 우측 상단] 유저 정보 및 액션 버튼
export const ProfileHeader = ({ userData, postCount }: ProfileHeaderProps) => {
  const MINIO_MEDIA_ENDPOINT = `${import.meta.env.VITE_MINIO_MEDIA_ENDPOINT}/`;
  const DEFAULT_PROFILE = `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image.png`;

  // [상태]
  // 1. 개인정보 수정 모달 열림 여부 관리
  const [ isPrivacyInfoModalOpen, setPrivacyInfoModalOpen] = useState(false);

  // 상황에 맞는 버튼을 반환하는 내부 렌더링 함수
  const renderActionButton = () => {
    if (userData.isMe) {
      return (
        <button 
          className="secondary outline"
          style={{ padding: '0.5rem 1rem' }}
          onClick={() => setPrivacyInfoModalOpen(true)}
        >
          개인정보 수정
        </button>
      );
    }
    if (userData.isFollowing) {
      return <button className="contrast outline" style={{ padding: '0.5rem 1rem' }}>친구 삭제</button>;
    }
    return <button style={{ padding: '0.5rem 1rem' }}>친구 추가</button>;
  };

  const finalImage = MINIO_MEDIA_ENDPOINT + userData.profileImageUrl;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      
      {/* [최상단] 닉네임 */}
      <div>
        <h3 style={{ margin: 0, fontWeight: 'bold' }}>{userData.nickname}</h3>
      </div>

      {/* [중간단] 좌측 프로필 이미지 / 우측 통계 지표들 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        
        {/* 프로필 이미지 */}
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--pico-muted-color)', overflow: 'hidden', flexShrink: 0 }}>
          <img 
            src={finalImage || DEFAULT_PROFILE} 
            alt={`${userData.nickname} 프로필 이미지`} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            onError={(e) => { e.currentTarget.src = DEFAULT_PROFILE; }}
          />
        </div>
        
        {/* 게시물 수 / 팔로워 / 팔로잉 수 수평 배열 */}
        <div style={{ display: 'flex', gap: '2rem', flex: 1, justifyContent: 'flex-start' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', color: 'var(--pico-muted-color)', fontSize: '0.85rem' }}>게시물</span>
            <strong style={{ fontSize: '1.1rem' }}>{formatCount(postCount)}</strong>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', color: 'var(--pico-muted-color)', fontSize: '0.85rem' }}>팔로워</span>
            <strong style={{ fontSize: '1.1rem' }}>{formatCount(userData.followerCount)}</strong>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', color: 'var(--pico-muted-color)', fontSize: '0.85rem' }}>팔로잉</span>
            <strong style={{ fontSize: '1.1rem' }}>{formatCount(userData.followingCount)}</strong>
          </div>
        </div>

      </div>

      {/* [함께 아는 친구] */}
      {!userData.isMe && userData.mutualFollowerCount > 0 && (
        <div style={{ marginTop: '-0.5rem' }}>
          <small style={{ color: 'var(--pico-muted-color)' }}>
            {userData.mutualFollowerCount === 1 ? (
              // 함께 아는 친구가 1명일 때
              `${userData.representativeMutualNickname}님과 함께 아는 친구입니다.`
            ) : (
              // 함께 아는 친구가 2명 이상일 때
              `${userData.representativeMutualNickname}님 외 ${userData.mutualFollowerCount - 1}명과 함께 아는 친구`
            )}
          </small>
        </div>
      )}

      {/* [하단] 가로로 길게 채워지는 액션 버튼 영역 */}
      <div style={{ width: '100%', marginTop: '0.5rem' }}>
        {renderActionButton()}
      </div>

      {/* [모달] 개인정보 변경 모달 영역 */}
      <UserPrivacyInfoUpdateModal
        isOpen={isPrivacyInfoModalOpen}
        onClose={() => setPrivacyInfoModalOpen(false)}
      />

    </div>
  );
};