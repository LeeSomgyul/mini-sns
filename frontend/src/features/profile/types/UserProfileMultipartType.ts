// [1단계] 프로필 이미지 분할 업로드 시작
export interface ProfileCreateMultipartRequest{
    filename: string;
    contentType: string;
    fileSize: number;
}

export interface ProfileCreateMultipartResponse{
    uploadId: string;
    objectKey: string;
}

// [2단계] 이미지 조각 파일 별 Presigned URL 발급 (서명)
export interface ProfileSingPartRequest{
    uploadId: string;
    objectKey: string;
    partNumber: number;
}

export interface ProfileSingPartResponse{
    presignedUrl: string;
}


// [3단계] 프론트엔드가 MiniO에 Presigned URL로 파일을 잘 저장했는지 리스트 꺼내서 확인
export interface ProfileMultipartListPartsRequest{
    uploadId: string;
    objectKey: string;
}

export interface ProfileMultipartListPartsResponse{
    parts: PartInfo[];
}

export interface PartInfo{
    partNumber: number;
    size: number;
    eTag: string;
}

// [4단계] MiniO에서 분할된 조각들 가져와서 순서대로 합치기
export interface ProfileCompleteRequest{
    uploadId: string;
    objectKey: string;
    parts: CompletedPart[];
}

export interface CompletedPart{
    PartNumber: number;
    ETag: string;
}

export interface ProfileCompleteResponse{
    location: string;
}

// [5단계] 프로필 이미지 분할 업로드 시 사용자가 중간에 취소한 경우, MiniO 서버에 저장된 파편들 제거
export interface AbortProfileMultipartRequest {
    uploadId: string;
    objectKey: string;
}