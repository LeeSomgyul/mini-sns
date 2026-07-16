export interface PostUserProfileResponse {
  postCount: number;
  thumbnails: ProfileThumbnail[];
  hasNextPage: boolean;
}

export interface ProfileThumbnail {
  postId: number;
  thumbnailUrl: string;
}