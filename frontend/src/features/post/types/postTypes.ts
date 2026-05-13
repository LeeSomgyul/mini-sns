import type {CropUIState} from '../components/PostImageCropModal';

export type backendFileType = 'IMAGE' | 'VIDEO' | 'THUMBNAIL';
type backendMediaType = 'IMAGE' | 'VIDEO';

//[useMediaManager.ts 에서 사용]
//1.업로드 시작: 백엔드에서 objectKey와 uploadId를 받아옴
export interface CreateMultipartRequest{
    filename: string;
    fileType: backendFileType;
    contentType: string;
}

export interface CreateMultipartResponse{
    uploadId: string;
    objectKey: string;
}

//2.조각(partNumber)별 Presigned URL 발급
export interface SingPartRequest{
    uploadId: string;
    objectKey: string;
    partNumber: number;
}

export interface SingPartResponse{
    presignedUrl: string;
}

//3.어디까지 올렸는지 조회
export interface ListPartsRequest{
    uploadId: string;
    objectKey: string;
}

export interface ListPartsResponse{
    parts: {PartNumber: number; Size: number; ETag: string}[];
}

//4.MiniO에 최종 저장 및 조각들 순서대로 조립 완료
export interface CompleteMultipartRequest{
    uploadId: string;
    objectKey: string;
    parts: {PartNumber: number; ETag: string}[];
}

export interface CompleteMultipartResponse{
    location: string;
}

//5.업로드 취소
export interface AbortMultipartRequest{
    uploadId: string;
    objectKey: string;
}


//-----------------(아래)수정 전----------------

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