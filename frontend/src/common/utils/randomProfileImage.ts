// [백엔드에서 profileImage가 null일 경우 userId를 기준으로 하여 랜덤 프로필이미지 부여]
const DEFAULT_PROFILE_IMAGES = [
    'default_profile_image_1.png',
    'default_profile_image_2.png',
    'default_profile_image_3.png',
    'default_profile_image_4.png',
    'default_profile_image_5.png',
    'default_profile_image_6.png',
    'default_profile_image_7.png',
    'default_profile_image_8.png',
    'default_profile_image_9.png',
    'default_profile_image_10.png',
    'default_profile_image_11.png',
    'default_profile_image_12.png',
    'default_profile_image_13.png',
    'default_profile_image_14.png',
];

// 1. 등록된 프로필 이미지/미디어용 Base URL
const MINIO_MEDIA_ENDPOINT = (import.meta.env.VITE_MINIO_MEDIA_ENDPOINT || '').replace(/\/+$/, '');

// 2. 기본 랜덤 프로필 이미지용 Base URL
const MINIO_DEFAULT_URL = (import.meta.env.VITE_MINIO_DEFAULT_URL || '').replace(/\/+$/, '');
interface ProfileImageUrlProps{
    profileImageUrl: string | null | undefined;
    userId: number | null | undefined;
}

export const getProfileImageUrl = ({profileImageUrl, userId}: ProfileImageUrlProps) => {
    
    // 1. 프로필 이미지 url이 존재할 때 (endpoint 포함 url 또는 일반 url 섞여있음)
    if(profileImageUrl && profileImageUrl.trim() !== ''){
        // 1-1. http:// 또는 https://로 시작하는 경로인 경우
        if(profileImageUrl.startsWith('http://') || profileImageUrl.startsWith('https://')){
            return profileImageUrl;
        }

        // 1-2. 일반 url인 경우
        const url = profileImageUrl.startsWith('/')
            ? profileImageUrl.slice(1)
            : profileImageUrl;

        return `${MINIO_MEDIA_ENDPOINT}/${url}`;
    }

    // 2. url이 null인 경우 (userId가 없으면 0번째 이미지 사용)
    const isInvalidUserId = userId === null || userId === undefined;

    const numericId = isInvalidUserId
        ? 0
        : typeof userId === 'number'
            ? userId
            : String(userId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const imageIndex = isInvalidUserId ? 0 : Math.abs(numericId) % DEFAULT_PROFILE_IMAGES.length;
    const defaultFilename = DEFAULT_PROFILE_IMAGES[imageIndex];

    return `${MINIO_DEFAULT_URL}/${defaultFilename}`;
};