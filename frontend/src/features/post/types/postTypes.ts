import type {CropUIState} from '../components/PostImageCropModal';

type backendFileType = 'IMAGE' | 'VIDEO' | 'THUMBNAIL';
type backendMediaType = 'IMAGE' | 'VIDEO';

export interface PresignedUrlRequest {
    filename: string;
    fileType: backendFileType;
}

export interface PresignedUrlResponse{
    presignedUrl: string;
    objectKey: string;
}

export interface postRequest{
    mediaList: MediaUploadRequest[];
    content: string;
    tagUserIds: number[];
}

export interface MediaUploadRequest{
    mediaUrl: string;
    mediaType: backendFileType;
    cropState: CropUIState | null;
}

export interface postResponse{
    postId: number;
    authorId: number;
    thumbnailUrl: string;
    mediaList: MediaResponse[]; 
    content: string;
    tagUsers: TagUserResponse[];
}

export interface MediaResponse {
    mediaId: number;
    type: backendMediaType;
    url: string;
    thumbnailUrl: string;
    sortOrder: number;
}

export interface TagUserResponse {
    userId: number;
    nickname: string;
}