import type {CropUIState} from '../components/PostImageCropModal';

export type backendFileType = 'IMAGE' | 'VIDEO' | 'THUMBNAIL';
type backendMediaType = 'IMAGE' | 'VIDEO';

//[useMediaManager.ts 에서 사용]
//1.업로드 시작: 백엔드에서 objectKey와 uploadId를 받아옴
export interface CreateMultipartRequest{
    filename: string;
    fileType: backendFileType;
    contentType: string;
    fileSize: number;
}

export interface CreateMultipartResponse{
    uploadId: string;
    objectKey: string;
}

//2.서명: 조각(partNumber)별 Presigned URL 발급
export interface SingPartRequest{
    uploadId: string;
    objectKey: string;
    partNumber: number;
}

export interface SingPartResponse{
    presignedUrl: string;
}

//3.확인: minio에 조각들이 잘 도착했나 확인 (전송은 2번과 3번 사이에서 프론트에서 함)
export interface ListPartsRequest{
    uploadId: string;
    objectKey: string;
}

export interface ListPartsResponse{
    //PartNumber: 각 파일(uploadId)의 몇번째 조각인지
    //Size: 조각의 용량
    //ETag: 조각이 잘 들어왔다는 증표(식별값)
    parts: {PartNumber: number; Size: number; ETag: string}[];
}

//4.조립: 조각들 합치기
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
    originalFileName: string;
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