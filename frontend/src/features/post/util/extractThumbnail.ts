//1. 비디오에서 1초 부분 캡처하기
export const extractVideoThumbnail = (videoFile : File): Promise<File> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const url = URL.createObjectURL(videoFile);

        video.src = url;
        video.muted = true;
        video.playsInline = true;

        //1초 지점으로 이동
        video.onloadedmetadata = () => {
            video.currentTime = 1;
        };

        //1초 이동 후 캡처
        video.onseeked = async() => {
            try{
                const thumbnailFile = await generateSquareThumbnail(video, video.width, video.height, videoFile.name);
                URL.revokeObjectURL(url);
                resolve(thumbnailFile);
            }catch(error){
                reject(error);
            }
        };
        video.onerror = () => reject(new Error('비디오 로드 실패'));
    });
};

//2. 이미지 크기 줄여서 썸네일 제작
export const extractImageThumbnail = async(imageFile: File): Promise<File> => {
    const bitmap = await createImageBitmap(imageFile);//이미지를 비트맵형식으로 변경
    const thumbnailFile = await generateSquareThumbnail(bitmap, bitmap.width, bitmap.height, imageFile.name);
    bitmap.close();
    return thumbnailFile;
};

const THUMB_SIZE = 500;

//[메서드] 500*500 비율로 썸네일 자르기
const generateSquareThumbnail = (
    source: CanvasImageSource,
    width: number,
    height: number,
    fileName: string
):Promise<File> => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = THUMB_SIZE;
        canvas.height = THUMB_SIZE;

        const context = canvas.getContext('2d');

        const minSize = Math.min(width, height);
        const sx = (width - minSize)/2;
        const sy = (height - minSize)/2;

        context?.drawImage(source, sx, sy, minSize, minSize, 0, 0, THUMB_SIZE, THUMB_SIZE);

        canvas.toBlob((blob) => {
            if(blob){
                const thumbnailFile = new File([blob], `thumb_${fileName}.jpg`, {type: 'image/jpeg'});
                resolve(thumbnailFile);
            }else{
                reject(new Error('이미지 썸네일 생성 실패'));
            }
        }, 'image/jpeg', 0.8);
    });
};