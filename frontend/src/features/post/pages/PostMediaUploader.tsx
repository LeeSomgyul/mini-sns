import PostWebcamModal from '../components/PostWebcamModal';
import PostImageCropModal, { type CropUIState } from '../components/PostImageCropModal';
import { useMediaManager } from '../hooks/useMediaManager';
import { useMediaUI } from '../hooks/useMediaUI';
import { useState } from 'react';

interface PostMediaUploader {
    mode: 'create' | 'edit';
}

export default function PostMediaUploader({mode}: PostMediaUploader) {

    // 해당 모달의 모드
    const isEdit = mode == 'edit';

    const {mediaList ,actions, isMaxReached} = useMediaManager();
    const {uiState, uiActions, fileInputRef} = useMediaUI();

    const [isVideoPlaying, setIsVideoPlaying] = useState(false);//비디오 재생중 여부

       
    //[미디어 제거 핸들러]
    const onRemoveMedia = (indexToRemove: number) => {
        //업로드 했던 데이터 삭제
        actions.removeMedia(indexToRemove);
        
        //UI 상태 업데이트
         if (uiState.choiceMediaNum === indexToRemove) {
            uiActions.setChoiceMediaNum(0);
        } else if (uiState.choiceMediaNum > indexToRemove) {
            uiActions.setChoiceMediaNum(prev => prev - 1);
        }
    };

    //[크롭 핸들러]
    const onCropComplete = (newCropState: CropUIState, newCroppedUrl: string) => {
        //현재 보고있는 인덱스의 새로운 크롭 상태 전달
        actions.completeCrop(uiState.choiceMediaNum, newCropState, newCroppedUrl);
        
        //모달 닫기
        uiActions.closeCropModal();
    }

    //[웹캠 핸들러]: 웹캠 모달 창 안에서 사진을 찍었을때 실행
    const onWebcamCapture = (file: File) => {
        const currentLength = mediaList.length;
        const isSuccess = actions.captureWebcam(file);

        if(isSuccess){
            uiActions.setChoiceMediaNum(currentLength);
            uiActions.closeWebcamModal();
        }
    };

    //현재 선택된 미디어
    const currentMedia = mediaList[uiState.choiceMediaNum];

    return (
        <div className="flex flex-col gap-2.5 h-full">
            {/* 웹캠 모달 */}
            {uiState.isWebcamOpen && (
                <PostWebcamModal
                    closeModal={uiActions.closeWebcamModal}
                    captureResult={onWebcamCapture}
                />
            )}
            {/* 이미지 편집 모달 */}
            {uiState.isCropModalOpen && currentMedia && currentMedia.type === 'IMAGE' && (
                <PostImageCropModal
                    imageUrl={currentMedia.previewUrl}
                    originalFileName={currentMedia.originalFile.name}
                    initialCropState={currentMedia.cropState}
                    closeModal={uiActions.closeCropModal}
                    cropResult={onCropComplete}
                />
            )}

            {/* 상단 헤더 및 버튼 */}
            <div className="flex justify-between items-center">
                <div className="flex items-baseline gap-1">
                    <span className="text-[13.5px] font-normal text-[#1c1c21]">이미지 및 영상 등록</span>
                    <span className="text-[13.5px] text-[#9a9aa3]">({mediaList.length}/5)</span>
                </div>
                {!isEdit && (
                    <div className="flex gap-1.5">
                        <div>
                            <input
                                type="file"
                                accept="image/*,video/mp4,video/quicktime"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={actions.addMedia}
                                multiple
                            />
                            <button
                                type="button"
                                className="flex items-center justify-center w-[30px] h-[30px] rounded-[10px] bg-[#f4f4f6] hover:bg-[#eaeaed] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isMaxReached}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 text-[#3a3a41]">
                                    <path fill-rule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <button
                            type="button"
                            className="flex items-center justify-center w-[30px] h-[30px] rounded-[10px] bg-[#f4f4f6] hover:bg-[#eaeaed] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isMaxReached}
                            onClick={uiActions.openWebcamModal}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 text-[#5cc8f1]">
                                <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
                                <path fill-rule="evenodd" d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 0 0 1.11-.71l.822-1.315a2.942 2.942 0 0 1 2.332-1.39ZM6.75 12.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Zm12-1.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* 메인 미리보기 화면 */}
            <div className="flex-1 min-h-0 aspect-square bg-white rounded-2xl border border-black/50 flex items-center justify-center overflow-hidden">
                {mediaList.length > 0 && currentMedia ? (
                    currentMedia.type === 'VIDEO' ? (
                        isVideoPlaying ? (
                            <video
                                src={currentMedia.previewUrl}
                                controls
                                autoPlay
                                className="w-full h-full object-contain bg-black"
                            />
                        ) : (
                            <div
                                onClick={() => setIsVideoPlaying(true)}
                                className="relative w-full h-full cursor-pointer bg-black"
                            >
                                <video
                                    src={currentMedia.previewUrl}
                                    className="w-full h-full object-contain bg-black"
                                    preload="metadata"
                                />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60px] h-[60px] bg-black/60 rounded-full flex items-center justify-center text-white text-2xl">
                                    ▶
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="relative w-full h-full">
                            <img
                                src={currentMedia.croppedPreviewUrl || currentMedia.previewUrl}
                                alt="미리보기"
                                className="w-full h-full object-cover"
                            />
                            {!isEdit && (
                                <button
                                    type="button"
                                    className="absolute top-2.5 right-2.5 px-2 py-1 text-xs bg-black/60 border-0 text-white rounded-md cursor-pointer hover:bg-black/80 transition-colors"
                                    onClick={uiActions.openCropModal}
                                >
                                    편집
                                </button>
                            )}
                        </div>
                    )
                ) : (
                    <span className="text-[13px] text-[#b7b7bd]">이미지 및 영상을 추가해주세요.</span>
                )}
            </div>

            {/* 하단 썸네일 */}
            <div className="grid grid-cols-5 gap-1.5">
                {[0, 1, 2, 3, 4].map((index) => {
                    const hasMedia = index < mediaList.length;
                    const isChoice = index === uiState.choiceMediaNum;

                    return (
                        <div
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (hasMedia) {
                                    setIsVideoPlaying(true);
                                    uiActions.setChoiceMediaNum(index);
                                }
                            }}
                            className={`relative aspect-square rounded-[10px] overflow-hidden flex items-center justify-center border ${
                                hasMedia ? 'bg-white cursor-pointer' : 'bg-[#e5e7eb] cursor-default'
                            } ${isChoice ? 'border-2 border-[#5cc8f1]' : 'border-none'}`}
                        >
                            {hasMedia ? (
                                <>
                                    {mediaList[index].type === 'VIDEO' ? (
                                        <video src={mediaList[index].previewUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <img
                                            src={mediaList[index].croppedPreviewUrl || mediaList[index].previewUrl}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                    {!isEdit && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRemoveMedia(index);
                                            }}
                                            className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 text-white text-[10px] leading-none flex items-center justify-center cursor-pointer hover:bg-black/80"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </>
                            ) : (
                                <span></span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}