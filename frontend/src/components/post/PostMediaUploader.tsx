import { useRef, useState, type Dispatch, type SetStateAction } from 'react';
import toast from 'react-hot-toast';
import type { SelectedMediaType } from '../../types/post/SelectedMediaType';
import { getVideoValidation } from '../../utils/videoValidation';
import PostWebcamModal from '../post/PostWebcamModal';
import PostImageCropModal from '../post/PostImageCropModal';

interface PostMediaUploaderProps {
    mediaList: SelectedMediaType[];
    setMediaList: Dispatch<SetStateAction<SelectedMediaType[]>>;
    choiceMediaNum: number;
    setChoiceMediaNum: Dispatch<SetStateAction<number>>;
}

//Post (게시물작성, 좌측): 미디어 추가, 미리보기, 썸네일 5칸
export default function PostMediaUploader({mediaList, setMediaList, choiceMediaNum, setChoiceMediaNum}: PostMediaUploaderProps){
    
    const fileInputRef = useRef<HTMLInputElement>(null);//미디어 추가 버튼에서 숨겨진 file input 조종
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);//미리보기 화면 영상 재생 상태
    const [isWebcamOpen, setIsWebcamOpen] = useState(false);//웹캠 모달 오픈 여부
    const [isCropModalOpen ,setIsCropModalOpen] = useState(false);//이미지 편집 모달 오픈 여부
    
    const isMaxReached = mediaList.length >= 5;
    const LIMIT = 5;

    //[추가 버튼] 클릭 시 파일 추가 input 실행
    const handleAddMedia = () => {
        console.log("함수 호출됨!");
        console.log("현재 리스트 개수:", mediaList.length);
        if(isMaxReached){
            toast.error('이미지 및 파일은 최대 5개까지만 업로드 가능합니다.');
            return;
        }
        fileInputRef.current?.click();
    };

    //[파일 추가] 사용자가 파일을 선택했을 때 실행됨
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(e.target.files || []);
        if(!newFiles || newFiles.length === 0) return;

        const rejectedFiles: string[] = [];//추가 실패한 파일들 보관함
        const validFiles: SelectedMediaType[] = [];//통과한 파일들 보관함

        //5개 초과 확인
        const currentMediaCount = mediaList.length;//기존 미디어 개수
        const isOverLimit = currentMediaCount + newFiles.length > LIMIT;

        if(isOverLimit){
            toast.error(`최대 ${LIMIT}개까지만 등록 가능합니다.`);
        }

        //초과분은 자르고 미디어 리스트에 저장
        const availableFiles = newFiles.slice(0, LIMIT-currentMediaCount);

        for(const file of availableFiles){
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');

            //이미지 용량 체크(이미지 10MB)
            if(isImage && file.size > 10 * 1024 * 1024){
                rejectedFiles.push(file.name);
                continue;
            }

            //영상 용량 및 길이 체크(100MB, 60초)
            if(isVideo){
                if(file.size > 100 * 1024 * 1024){
                    rejectedFiles.push(file.name);
                    continue;
                }

                try{
                    const videoDuration = await getVideoValidation(file);
                    if(videoDuration > 60){
                        rejectedFiles.push(file.name);
                        continue;
                    }
                }catch(error){
                    rejectedFiles.push(file.name);
                    continue;
                }
            }

            validFiles.push({
                file: file,
                previewUrl: URL.createObjectURL(file)
            });
        }

        //추가 실패한 파일에 대한 종합 알림
        if(rejectedFiles.length > 0){
            toast.error(`${rejectedFiles.length}개 제외: 사진 10MB / 영상 100MB·60초 제한`,{
                duration: 5000
            })
        }

        setMediaList(prev => [...prev, ...validFiles]);
        if(fileInputRef.current) fileInputRef.current.value = '';//동일한 파일 선택할 수 있도록 input 초기화
    };

    //[웹캠 버튼]
    const handleOpenWebcam = async() => {
        //브라우저가 카메라 api를 지원하지 않는 환경인지 체크
        if(!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices){
            toast.error('이 브라우저 환경에서는 카메라를 지원하지 않습니다.');
            return;
        }

        try{
            //연결된 장치 목록 가져오기
            const devices = await navigator.mediaDevices.enumerateDevices();

            //비디오 입력 장치가 있는지 확인
            const hasCamera = devices.some(device => device.kind === 'videoinput');

            if(!hasCamera){
                toast.error('카메라 장치를 찾을 수 없습니다.');
                return;
            }

            setIsWebcamOpen(true);
        }catch(error){
            toast.error("카메라 상태를 확인할 수 없습니다.");
        }
    }

    //[웹캠 실행] 
    const handleWebcamCapture = (file: File) => {
        if(mediaList.length >= 5){
            toast.error(`최대 ${LIMIT}개까지만 등록 가능합니다.`);
            return;
        }

        const newMedia: SelectedMediaType = {
            file: file,
            previewUrl: URL.createObjectURL(file)
        }

        setMediaList(prev => [...prev, newMedia]);
        setChoiceMediaNum(mediaList.length);
    };

    //[미리보기 제거] 클릭 시 선택했던 미디어 제거
    const handleRemoveMedia = (indexToRemove: number) => {
        setMediaList(prev => {
            const newList = prev.filter((_,index) => index !== indexToRemove);
            URL.revokeObjectURL(prev[indexToRemove].previewUrl);//임시 url 폐기(메모리 누수 방지)
            return newList
        });

        if(choiceMediaNum == indexToRemove) {
            setChoiceMediaNum(0);//삭제한 이미지가 현재 보고있는 이미지라면 0번으로 초기화
            setIsVideoPlaying(false);//비디오 플레이 멈춤
        }else if(choiceMediaNum > indexToRemove){
            setChoiceMediaNum(choiceMediaNum-1);//내 앞에 인덱스 미디어가 제거되면 인덱스 한칸씩 앞으로 이동
        } 
    };

    //[미리보기 이미지 수정]
    const handleCropComplete = (croppedFile: File, newCropState: any) => {
        setMediaList((prev) => {
            const newList = [...prev];
            const deleteMedia = newList[choiceMediaNum];

            //기존 이미지 메모리에서 제거
            if(deleteMedia.croppedPreviewUrl){
                URL.revokeObjectURL(deleteMedia.previewUrl);
            }

            newList[choiceMediaNum] = {
                ...deleteMedia,//원본 정보 유지(file, previewUrl)
                croppedFile: croppedFile,
                croppedPreviewUrl: URL.createObjectURL(croppedFile),
                cropState: newCropState
            };

            //mediaList를 새로운걸로 업데이트
            return newList;
        });

        setIsCropModalOpen(false);
    };

    //[하단 썸네일 클릭] 클릭 시 메인뷰 변경
    const handleThumbnailClick = (index: number) => {    
        setIsVideoPlaying(true);
        setChoiceMediaNum(index);
    };

    
    
    return (
        <div>
            {/* 웹캠 모달 */}
            {isWebcamOpen && (
                <PostWebcamModal
                    closeModal={() => setIsWebcamOpen(false)}
                    captureResult={handleWebcamCapture}
                />
            )}

            {/* 이미지 편집 모달 */}
            {isCropModalOpen && !mediaList[choiceMediaNum].file.type.startsWith('video/') && (
                <PostImageCropModal
                    imageUrl={mediaList[choiceMediaNum].previewUrl}
                    originalFileName={mediaList[choiceMediaNum].file.name}
                    initialCropState={mediaList[choiceMediaNum].cropState}
                    closeModal={() => setIsCropModalOpen(false)}
                    cropResult={handleCropComplete}
                />
            )}

            {/* 상단 제목 및 버튼 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                    <div style={{ margin: 0 ,fontSize: '1rem' }}>이미지 및 영상 등록</div>
                    <div style={{ fontSize: '0.7rem' }}>({mediaList.length}/5)</div>
                </div>
                <div style={{display: 'flex'}}>
                    {/* 미디어 추가 버튼 */}
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
                            style={{ marginRight: '8px', padding: '0.5rem' }}
                            disabled={isMaxReached}
                            onClick={handleAddMedia}
                        >
                            추가
                        </button>
                    </div>
                    {/* 웹캠 실행 버튼 */}
                    <button 
                        type="button"
                        className="secondary outline"
                        style={{ padding: '0.5rem' }}
                        disabled={isMaxReached}
                        onClick={handleOpenWebcam}
                    >
                        카메라
                    </button>
                </div>
            </div>

            {/* 메인 미리보기 화면 */}
            <div style={{ aspectRatio: '1/1', height: '100%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden' }}>
                {mediaList.length > 0 ? (
                    mediaList[choiceMediaNum].file.type.startsWith('video/') ? (
                        isVideoPlaying ? (
                            <video 
                                src={mediaList[choiceMediaNum].previewUrl}
                                controls
                                autoPlay
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <div onClick={() => setIsVideoPlaying(true)} style={{ width: '100%', height: '100%', position: 'relative', cursor: 'pointer' }}>
                                <video 
                                    src={mediaList[choiceMediaNum].previewUrl}
                                    controls={false}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60px', height: '60px', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '24px' }}>
                                    ▶
                                </div>
                            </div>
                        )
                    ) : (
                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                            <img
                                src={mediaList[choiceMediaNum].croppedPreviewUrl || mediaList[choiceMediaNum].previewUrl}
                                alt="미리보기"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
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

            {/* 하단 썸네일 5칸 */}
            <div className="grid" style={{ gap: '0.5rem' }}>
                {[0, 1, 2, 3, 4].map((index) => {
                    const hasMedia = index < mediaList.length;//해당 인덱스의 이미지 존재 유무(Boolean)
                    const isChoice = index === choiceMediaNum;//해당 인덱스 이미지 선택 유무(Boolean)

                    return (
                        <div 
                            key={index}
                            onClick={() => hasMedia && handleThumbnailClick(index)}
                            style={{ 
                                height: '80px', 
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
                                        <video
                                            src={mediaList[index].previewUrl}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <img
                                            src={mediaList[index].croppedPreviewUrl || mediaList[index].previewUrl}
                                            alt=""
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    )}
                                    <button
                                        type="button"
                                        className="close"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveMedia(index);
                                        }}
                                        style={{ position: 'absolute', top: '5px', right: '5px' }}
                                    >
                                    </button>                                
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
};