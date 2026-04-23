//영상의 길이를 초 단위로 반환
export const getVideoValidation = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const url = URL.createObjectURL(file);

        video.muted = true;
        video.playsInline = true;
        video.preload = 'metadata';//비디오 자체 말고 메타데이터 가져오기

        //[메서드] URL에 대한 메모리 청소
        const cleanup = () => {
            clearTimeout(timeout);
            URL.revokeObjectURL(url);
            video.remove();
        }

        //5초 타임아웃 설정(영상이 망가졌을때 대비)
        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error('영상 정보 로딩 시간 초과'));
        }, 5000);

        //영상의 정보(길이)를 다 읽었을 때 길이 반환
        video.onloadedmetadata = () => {
            cleanup();
            resolve(video.duration);
        };

        //로드 실패 시
        video.onerror = () => {
            cleanup();
            reject(new Error('영상을 읽을 수 없는 형식이거나 손상되었습니다.'));
        };

        video.src = url;
    });
};