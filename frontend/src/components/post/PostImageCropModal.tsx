import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import toast from 'react-hot-toast';

import {croppedImg} from '../../utils/croppedImg';

interface PostImageCropModalProps{
    imageUrl: string;//모달에서 편집할 원본 이미지 주소
    originalFileName: string;//결과물 이름
    initialCropState?: any;//원본 편집 상태(회전, 확대 등)
    closeModal: () => void;//닫기
    cropResult: (croppedFile: File, currentCropState: any) => void;//완료 시 원본 및 수정 후 상태 모두 반환
}

//사용자의 이미지 편집 모달
export default function PostImageCropModal({
    imageUrl,
    originalFileName,
    initialCropState,
    closeModal,
    cropResult
}: PostImageCropModalProps){
    const [crop, setCrop] = useState(initialCropState?.crop || {x:0, y:0});//위치 상태(0,0 에서 시작)
    const [zoom, setZoom] = useState(initialCropState?.zoom || 1);//확대 상태(1배에서 시작)
    const [rotation, setRotation] = useState(initialCropState?.rotation || 0);//회전 상태(0도에서 시작)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);//수정 후 위치,회전,좌표 결과 저장

    const [isProcessing, setIsProcessing] = useState(false);//수정 처리중 여부

    //[메서드] 자르기 영역 바뀔 때마다 좌표 저장
    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    },[]);

    //[초기화 버튼]
    const handleReset = () => {
        setCrop({x:0, y:0});
        setZoom(1);
        setRotation(0);
    };

    //[저장 버튼]
    const handleSave = async() => {
        if(!croppedAreaPixels) return;
        try{
            setIsProcessing(true);
            const uniqueId = crypto.randomUUID();
            const croppedFile = await croppedImg(imageUrl, croppedAreaPixels, rotation, `crop_${uniqueId}_${originalFileName}`);
            cropResult(croppedFile, {crop, zoom, rotation});
        }catch(error){
            toast.error("이미지를 처리에 실패했습니다.");
        }finally{
            setIsProcessing(false);
        }
    };

    return createPortal(
        <dialog open style={{ zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <article style={{ width: '90vw', maxWidth: '600px', backgroundColor: '#fff', padding: '1rem', borderRadius: '8px' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>이미지 편집</div>
                    <button aria-label="Close" className="close" onClick={closeModal}></button>
                </header>

                {/* 이미지 수정 영역 */}
                <div style={{ position: 'relative', width: '100%', height: '400px', backgroundColor: '#333', borderRadius: '8px', overflow: 'hidden' }}>
                    <Cropper
                        image={imageUrl}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={1/1}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                        onCropComplete={onCropComplete}
                        restrictPosition={true}
                        showGrid={true}
                    />
                </div>

                {/* 하단 컨트롤러 영역 */}
                <div style={{ marginTop: '1rem' }}>
                    {/* zoom (확대) 조절 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <span style={{ whiteSpace: 'nowrap' }}>확대</span>
                        <input 
                            type="range" value={zoom} min={1} max={3} step={0.1}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            style={{ width: '100%' }}
                        />
                    </div>
                    {/* rotation (회전) 조절 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <span style={{ whiteSpace: 'nowrap' }}>회전</span>
                        <input 
                            type="range" value={rotation} min={0} max={360} step={1}
                            onChange={(e) => setRotation(Number(e.target.value))}
                            style={{ width: '100%' }}
                        />
                    </div>

                    {/* 완료 & 초기화 버튼 */}
                    <footer style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                            type="button"
                            className="secondary outline"
                            onClick={handleReset}
                            style={{ width: '30%' }}
                        >
                            초기화
                        </button>
                        <button 
                            type="button"
                            onClick={handleSave}
                            style={{ width: '70%' }}
                            aria-busy={isProcessing}
                        >
                            {isProcessing ? '처리 중' : '완료'}
                        </button>
                    </footer>
                </div>
            </article>
        </dialog>,
        document.body
    );
};