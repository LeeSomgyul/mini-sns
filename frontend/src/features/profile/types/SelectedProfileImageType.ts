// [프로필 이미지 1개당 갖는 데이터(구조)]
export interface SelectedProfileImageType{
    id: string;                                 //uppy 파일 고유 id
    status: 'UPLOADING' | 'SUCCESS' | 'ERROR';  // 업로드 상태
    previewUrl: string;                         // 개인정보 변경의 화면 원형 영역에 즉시 띄울 미리보기 URL
    originalFile: File;                         // 원본 파일 경로
    originalKey?: string;                       // MiniO 서버에 저장된 진짜 파일 경로
}