import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Cropper, { type Point ,type Area } from 'react-easy-crop';

import {getCroppedImgPreview} from "../util/getCroppedImgPreview";

// [상태] PostImageCropModalProps의 cropResult
export interface CropUIState{
    crop: Point;//{x,y} 위치
    zoom: number;//확대 배율
    rotation: number;//회전 각도
    croppedAreaPixels?: Area | null;//최종 자르기 픽셀 영역
}

// [상태] 편집 이후 미디어 주소 + 편집 값
interface PostImageCropModalProps{
    imageUrl: string;//모달에서 편집할 원본 이미지 주소
    originalFileName: string;//결과물 이름
    initialCropState?: CropUIState;//원본 편집 상태(회전, 확대 등)
    closeModal: () => void;//닫기
    cropResult: (newCropState: CropUIState, newCroppedUrl: string) => void;//완료 시 원본 및 수정 후 상태 모두 반환
}

// [모달] 이미지 편집
export default function PostImageCropModal({
    imageUrl,
    initialCropState,
    closeModal,
    cropResult
}: PostImageCropModalProps){

    //[상태 초기화]
    const [crop, setCrop] = useState<Point>(initialCropState?.crop || {x:0, y:0});//위치 상태(0,0 에서 시작)
    const [zoom, setZoom] = useState<number>(initialCropState?.zoom || 1);//확대 상태(1배에서 시작)
    const [rotation, setRotation] = useState<number>(initialCropState?.rotation || 0);//회전 상태(0도에서 시작)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area|null>(initialCropState?.croppedAreaPixels || null);//수정 후 위치,회전,좌표 결과 저장


    //[이미지 수정] 자르기 영역 바뀔 때마다 좌표 저장
    const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    },[]);

    //[이미지 수정] 90도씩 회전
    const handleRotate90 = () => {
        setRotation((prev: number) => (prev + 90) % 360);
    };

    //[초기화 버튼]
    const handleReset = () => {
        setCrop({x:0, y:0});
        setZoom(1);
        setRotation(0);
    };

    //[크롭 편집 저장 버튼]
    const handleSave = async() => {

        if(!croppedAreaPixels) return;

        try{
            //1. 프론트엔드 미리보기용 이미지 URL 생성
            const newCroppedUrl = await getCroppedImgPreview(
                imageUrl,
                croppedAreaPixels,
                rotation
            );

            //2. 부모(PostImageCropModal)에게 전달할 데이터 정리
            const newCropState: CropUIState = {
                crop,
                zoom,
                rotation,
                croppedAreaPixels//백엔드에서 실제로 자를 때 필요한 '진짜 픽셀 좌표'
            }

            //3. 부모에게 상태 전달
            cropResult(newCropState, newCroppedUrl);
        }catch(error){
            console.error("이미지 자르기 처리 중 오류 발생: ", error);
        }
    };

    return createPortal(
        <dialog
            open
            className="fixed inset-0 z-[9999] m-0 flex h-full w-full max-h-none max-w-none items-center justify-center bg-black/90 p-0"
        >
            <article className="w-[90vw] max-w-[600px] rounded-3xl bg-white/95 backdrop-blur-xl border border-white/60 shadow-[0_30px_70px_rgba(0,0,0,0.2)] p-5">
                <header className="flex justify-between items-center mb-4">
                    <span className="text-base font-semibold text-[#2b2b31]">이미지 편집</span>
                    <button
                        aria-label="Close"
                        onClick={closeModal}
                        className="flex items-center justify-center w-8 h-8 rounded-[10px] bg-black/5 hover:bg-black/10 cursor-pointer transition-colors"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="#6a6a72" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                </header>

                {/* 이미지 수정 영역 */}
                <div className="relative w-full h-[400px] bg-[#333] rounded-2xl overflow-hidden">
                    <Cropper
                        image={imageUrl}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={1/1}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                        restrictPosition={true}
                        showGrid={true}
                    />
                </div>

                {/* 하단 컨트롤러 영역 */}
                <div className="mt-4">
                    {/* zoom (확대) 조절 */}
                    <div className="flex items-center gap-4 mb-4 mx-4">
                        <span className="whitespace-nowrap text-sm text-[#3a3a41]">확대</span>
                        <input
                            type="range" value={zoom} min={1} max={3} step={0.1}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full accent-[#5cc8f1]"
                        />
                    </div>
                    {/* rotation (회전) 조절 */}
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            type="button"
                            onClick={handleRotate90}
                            className="px-4 py-1.5 rounded-lg bg-white text-sm text-[#3a3a41] cursor-pointer hover:bg-white/60 transition-colors"
                        >
                            회전
                        </button>
                    </div>

                    {/* 완료 & 초기화 버튼 */}
                    <footer className="flex gap-4">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="w-[30%] h-11 rounded-xl bg-white text-[#3a3a41] text-sm font-semibold cursor-pointer hover:bg-white/60 transition-colors"
                        >
                            초기화
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="w-[70%] h-11 rounded-xl bg-[#5cc8f1] text-white text-sm font-semibold cursor-pointer hover:bg-[#49b8e3] transition-colors"
                        >
                            완료
                        </button>
                    </footer>
                </div>
            </article>
        </dialog>,
        document.body
    );
};