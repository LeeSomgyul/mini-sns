//업로드되는 게시물 1개당 갖는 데이터
export interface SelectedMediaType{
    //[필수]
    id: string;//Uppy의 file.id
    type: 'IMAGE' | 'VIDEO';
    status: 'UPLOADING' | 'SUCCESS' | 'ERROR';//업로드 진행 상태

    //[프론트엔드 UI 및 편집용 데이터]
    previewUrl: string;//화면 미리보기용 원본 URL
    originalFile: File;//편집에서 사용될 원본 파일
    
    //[서버 전송용 데이터]
    originalKey?: string;//원본 파일 경로

    //[수정 데이터]
    cropState:{
        crop: {x: number, y: number};
        zoom: number;
        rotation: number;
    }
};