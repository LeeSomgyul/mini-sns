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

    if(!context) throw new Error("캔버스의 context를 찾을 수 없습니다.");

    const radianAngle = (rotation * Math.PI) / 180;
    const bBoxWidth = Math.abs(Math.cos(radianAngle) * image.width) + Math.abs(Math.sin(radianAngle) * image.height);
    const bBoxHeight = Math.abs(Math.sin(radianAngle) * image.width) + Math.abs(Math.cos(radianAngle) * image.height);

    //사진 크기에 맞는 캔버스 준비
    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    //회전 기능(사진의 가운대를 중점으로 회전 가능)
    context.translate(bBoxWidth/2, bBoxHeight/2);
    context.rotate(radianAngle);
    context.translate(-image.width/2, -image.height/2);
    context.drawImage(image,0 ,0);

    const data = context.getImageData(
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height
    );

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    context.putImageData(data,0,0);

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