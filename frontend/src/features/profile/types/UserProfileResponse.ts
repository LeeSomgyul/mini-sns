export interface UserProfileResponse {
  userId: number;
  nickname: string;
  name: string;
  profileImageUrl: string | null;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  isMe: boolean;
  mutualFollowerCount: number;
  representativeMutualNickname: string | null;
}