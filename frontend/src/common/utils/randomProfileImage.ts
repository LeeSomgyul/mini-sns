// [백엔드에서 profileImage가 null일 경우 userId를 기준으로 하여 랜덤 프로필이미지 부여]
const DEFAULT_PROFILE_IMAGES = [
    `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image_1.png`,
    `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image_2.png`,
    `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image_3.png`,
    `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image_4.png`,
    `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image_5.png`,
    `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image_6.png`,
    `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image_7.png`,
    `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image_8.png`,
    `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image_9.png`,
    `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image_10.png`,
    `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image_11.png`,
    `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image_12.png`,
    `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image_13.png`,
    `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image_14.png`,
];

interface ProfileImageUrlProps{
    profileImageUrl: string | null;
    userId: number | null;
}

export const getProfileImageUrl = ({profileImageUrl, userId}: ProfileImageUrlProps) => {
    // 만약 사용자가 프로필 이미지를 등록했다면 그대로 사용
    if(profileImageUrl) return profileImageUrl;

    if(userId === null || userId === undefined){
        return DEFAULT_PROFILE_IMAGES[0];
    }

    // null 이라면 랜덤 이미지 선택
    const numericId = typeof userId === 'number'
        ? userId
        : String(userId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const index = Math.abs(numericId) % DEFAULT_PROFILE_IMAGES.length;
    return DEFAULT_PROFILE_IMAGES[index];
};