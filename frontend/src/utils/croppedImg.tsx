//사용자가 이미지를 편집
export const croppedImg = async(
    imageSrc: string,
    pixelCrop: {x: number; y: number; width: number; height: number},
    rotation = 0,
    fileName: string
): Promise<File> => {
    const image = new Image();
    image.src = imageSrc;

    //사용자의 이미지를 가져올때까지 기다리기
    await new Promise((reslove) => image.onload = reslove);

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    //사진 크기에 맞는 캔버스 준비
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    //회전 기능(사진의 가운대를 중점으로 회전 가능)
    context?.translate(canvas.width/2, canvas.height/2);
    context?.rotate((rotation * Math.PI) / 180);
    context?.translate(-canvas.width/2, -canvas.height/2);

    //자르기 기능
    context?.drawImage(
        image,//원본 이미지
        pixelCrop.x,//원본의 어디부터 자를까? (x, y)
        pixelCrop.y,
        pixelCrop.width,//원본에서 얼마만큼 떼어낼까?
        pixelCrop.height,
        0, 0,//캔버스의 어디에다 붙일까?
        pixelCrop.width,//캔버스의 어떤 크기로 출력할까?
        pixelCrop.height
    );

    return new Promise((reslove, reject) => {
        canvas.toBlob((blob) => {
            if(blob){
                const file = new File([blob], fileName, { type: 'image/jpeg' });
                reslove(file);
            }else{
                reject(new Error('이미지 수정 캔버스가 비어 있습니다.'));
            }
        }, 'image/jpeg', 0.9);
    });
}