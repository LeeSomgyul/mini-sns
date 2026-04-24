//PostMediaUploader.tsx에서 업로드되는 게시물 1개당 갖는 데이터
export interface SelectedMediaType{
    //수정전 데이터 (원본 파일, 원본 화면에서 보여지는 미리보기 이미지)
    file: File;
    previewUrl: string;
    
    //수정후 데이터
    croppedFile?: File;
    croppedPreviewUrl?: string;
    cropState?:{
        crop: {x: number, y: number};
        zoom: number;
        rotation: number;
    }
};