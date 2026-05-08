import PostWebcamModal from '../components/PostWebcamModal';
import PostImageCropModal, { type CropUIState } from '../components/PostImageCropModal';
import { useMediaManager } from '../hooks/useMediaManager';
import { useMediaUI } from '../hooks/useMediaUI';
import { useState } from 'react';

export default function PostMediaUploader() {
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
    const onCropComplete = (newCropState: CropUIState) => {
        //현재 보고있는 인덱스의 새로운 크롭 상태 전달
        actions.completeCrop(uiState.choiceMediaNum, newCropState);
        
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
        <div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                    <div style={{ margin: 0, fontSize: '0.7rem' }}>이미지 및 영상 등록</div>
                    <div style={{ fontSize: '0.7rem' }}>({mediaList.length}/5)</div>
                </div>
                <div style={{ display: 'flex' }}>
                    <div>
                        <input
                            type="file"
                            accept="image/*,video/mp4,video/quicktime"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={actions.addMedia}
                        />
                        <button 
                            type="button" 
                            className="secondary outline" 
                            style={{ marginRight: '5px', padding: '0.3rem' }} 
                            disabled={isMaxReached} 
                            onClick={() => fileInputRef.current?.click()}
                        >
                            추가
                        </button>
                    </div>
                    <button 
                        type="button" 
                        className="secondary outline" 
                        style={{ padding: '0.3rem' }} 
                        disabled={isMaxReached} 
                        onClick={uiActions.openWebcamModal}
                    >
                        카메라
                    </button>
                </div>
            </div>

            {/* 메인 미리보기 화면 */}
            <div style={{ aspectRatio: '1/1', height: '100%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden' }}>
                {mediaList.length > 0 && currentMedia ? (
                    currentMedia.type === 'VIDEO' ? (
                        isVideoPlaying ? (
                            <video src={currentMedia.previewUrl} controls autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div onClick={() => setIsVideoPlaying(true)} style={{ width: '100%', height: '100%', position: 'relative', cursor: 'pointer' }}>
                                <video src={currentMedia.previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60px', height: '60px', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '24px' }}>
                                    ▶
                                </div>
                            </div>
                        )
                    ) : (
                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                            <img src={currentMedia.previewUrl} alt="미리보기" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button
                                type="button"
                                className="secondary"
                                style={{ position: 'absolute', top: '10px', right: '10px', padding: '0.2rem 0.5rem', fontSize: '0.8rem', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', borderRadius: '4px' }}
                                onClick={uiActions.openCropModal}
                            >
                                편집
                            </button>
                        </div>
                    )
                ) : (
                    <span style={{ color: '#9ca3af' }}>이미지 및 영상을 추가해주세요.</span>
                )}
            </div>

            {/* 하단 썸네일 */}
            <div className="grid" style={{ gap: '0.3rem', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)' }}>
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
                            style={{ 
                                height: '55px', 
                                aspectRatio: '1/1',
                                backgroundColor: hasMedia ? '#fff' : '#e5e7eb', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                position: 'relative', borderRadius: '4px', cursor: hasMedia ? 'pointer' : 'default',
                                border: isChoice ? '2px solid #000' : '1px solid #ccc', 
                                overflow: 'hidden'
                            }}
                        >
                            {hasMedia ? (
                                <>
                                    {mediaList[index].type === 'VIDEO' ? (
                                        <video src={mediaList[index].previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <img src={mediaList[index].previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    )}
                                    <button
                                        type="button"
                                        className="close"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveMedia(index);
                                        }}
                                        style={{ position: 'absolute', top: '5px', right: '5px' }}
                                    />                                
                                </>
                            ) : (
                                <span>+</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}