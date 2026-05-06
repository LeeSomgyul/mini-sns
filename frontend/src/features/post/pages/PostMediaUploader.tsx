import toast from 'react-hot-toast';
import { useMediaManager } from '../hooks/useMediaManager';
import PostWebcamModal from '../components/PostWebcamModal';
import PostImageCropModal from '../components/PostImageCropModal';

export default function PostMediaUploader() {
    const {
        mediaList,
        choiceMediaNum,
        setChoiceMediaNum,
        isVideoPlaying,
        setIsVideoPlaying,
        isWebcamOpen,
        setIsWebcamOpen,
        isCropModalOpen,
        setIsCropModalOpen,
        fileInputRef,
        isMaxReached,
        handleFileChange,
        handleRemoveMedia,
        handleWebcamCapture,
        handleCropComplete,
    } = useMediaManager();

    const handleAddMedia = () => {
        if (isMaxReached) {
            toast.error('이미지 및 파일은 최대 5개까지만 업로드 가능합니다.');
            return;
        }
        fileInputRef.current?.click();
    };

    const handleOpenWebcam = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            toast.error('이 브라우저 환경에서는 카메라를 지원하지 않습니다.');
            return;
        }
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasCamera = devices.some(device => device.kind === 'videoinput');
            if (!hasCamera) return toast.error('카메라 장치를 찾을 수 없습니다.');
            
            setIsWebcamOpen(true);
        } catch {
            toast.error('카메라 상태를 확인할 수 없습니다.');
        }
    };

    console.log("현재 RHF가 인식하는 mediaList:", mediaList);
    return (
        <div>
            {/* 모달 영역 */}
            {isWebcamOpen && (
                <PostWebcamModal
                    closeModal={() => setIsWebcamOpen(false)}
                    captureResult={handleWebcamCapture}
                />
            )}

            {isCropModalOpen && mediaList[choiceMediaNum] && !mediaList[choiceMediaNum].file.type.startsWith('video/') && (
                <PostImageCropModal
                    imageUrl={mediaList[choiceMediaNum].previewUrl}
                    originalFileName={mediaList[choiceMediaNum].file.name}
                    initialCropState={mediaList[choiceMediaNum].cropState}
                    closeModal={() => setIsCropModalOpen(false)}
                    cropResult={handleCropComplete}
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
                            onChange={handleFileChange}
                        />
                        <button 
                            type="button" 
                            className="secondary outline" 
                            style={{ marginRight: '5px', padding: '0.3rem' }} 
                            disabled={isMaxReached} 
                            onClick={handleAddMedia}
                        >
                            추가
                        </button>
                    </div>
                    <button 
                        type="button" 
                        className="secondary outline" 
                        style={{ padding: '0.3rem' }} 
                        disabled={isMaxReached} 
                        onClick={handleOpenWebcam}
                    >
                        카메라
                    </button>
                </div>
            </div>

            {/* 메인 미리보기 화면 */}
            <div style={{ aspectRatio: '1/1', height: '100%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden' }}>
                {mediaList.length > 0 && mediaList[choiceMediaNum] ? (
                    mediaList[choiceMediaNum].file.type.startsWith('video/') ? (
                        isVideoPlaying ? (
                            <video src={mediaList[choiceMediaNum].previewUrl} controls autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div onClick={() => setIsVideoPlaying(true)} style={{ width: '100%', height: '100%', position: 'relative', cursor: 'pointer' }}>
                                <video src={mediaList[choiceMediaNum].previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60px', height: '60px', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '24px' }}>
                                    ▶
                                </div>
                            </div>
                        )
                    ) : (
                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                            <img src={mediaList[choiceMediaNum].croppedPreviewUrl || mediaList[choiceMediaNum].previewUrl} alt="미리보기" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button
                                type="button"
                                className="secondary"
                                style={{ position: 'absolute', top: '10px', right: '10px', padding: '0.2rem 0.5rem', fontSize: '0.8rem', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', borderRadius: '4px' }}
                                onClick={() => setIsCropModalOpen(true)}
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
                    const isChoice = index === choiceMediaNum;

                    return (
                        <div 
                            key={index}
                            onClick={() => {
                                if (hasMedia) {
                                    setIsVideoPlaying(true);
                                    setChoiceMediaNum(index);
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
                                    {mediaList[index].file.type.startsWith('video/') ? (
                                        <video src={mediaList[index].previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <img src={mediaList[index].croppedPreviewUrl || mediaList[index].previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    )}
                                    <button
                                        type="button"
                                        className="close"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveMedia(index);
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