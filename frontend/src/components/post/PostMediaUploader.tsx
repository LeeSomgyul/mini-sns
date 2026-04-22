import { useRef, type Dispatch, type SetStateAction } from 'react';
import toast from 'react-hot-toast';
import type { SelectedMediaType } from '../../types/post/SelectedMediaType';
import { getVideoValidation } from '../../utils/videoValidation';

interface PostMediaUploaderProps {
    mediaList: SelectedMediaType[];
    setMediaList: Dispatch<SetStateAction<SelectedMediaType[]>>;
    choiceMediaNum: number;
    setChoiceMediaNum: Dispatch<SetStateAction<number>>;
}

//Post (게시물작성, 좌측): 미디어 추가, 미리보기, 썸네일 5칸
const PostMediaUploader = ({mediaList, setMediaList, choiceMediaNum, setChoiceMediaNum}: PostMediaUploaderProps) => {
    
    const fileInputRef = useRef<HTMLInputElement>(null);//미디어 추가 버튼에서 숨겨진 file input 조종
    const isMaxReached = mediaList.length >= 5;

    //[추가 버튼] 클릭 시 파일 추가 input 실행
    const handleAddMedia = () => {
        if(mediaList.length>=5){
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
        const LIMIT = 5;
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
                    }
                }catch(error){
                    rejectedFiles.push(file.name);
                    continue;
                }
            }

            validFiles.push({
                file: file,
                thumbnailUrl: URL.createObjectURL(file)
            });
        }

        //추가 실패한 파일에 대한 종합 알림
        if(rejectedFiles.length > 0){
            toast.error(`${rejectedFiles.length}개 제외: 사진 10MB / 영상 100MB·60초 제한`,{
                duration: 5000
            })
        }

        setMediaList(prev => [...prev, validFiles]);

        if(fileInputRef.current) fileInputRef.current.value = '';//동일한 파일 선택할 수 있도록 input 초기화
    };

    //[웹캠 버튼] 클릭 시 웹캠 실행
    const handleStartWebcam = () => {

    };

    //[미리보기 제거] 클릭 시 선택했던 미디어 제거
    const handleRemoveMedia = (indexToRemove: number) => {
        setMediaList(prev => {
            const newList = prev.filter((_,index) => index !== indexToRemove);
            URL.revokeObjectURL(prev[indexToRemove].thumbnailUrl);//임시 url 폐기(메모리 누수 방지)
            return newList
        });

        if(choiceMediaNum == indexToRemove) setChoiceMediaNum(0); //삭제한 이미지가 현재 보고있는 이미지라면 0번으로 초기화
    };
    
    return (
        <div>
            {/* 상단 제목 및 버튼 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                    <h4 style={{ margin: 0 }}>이미지 및 영상 등록</h4>
                    <small style={{ fontSize: '1rem' }}>({mediaList.length}/5)</small>
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
                        className="secondary outline"
                        style={{ padding: '0.5rem' }}
                        disabled={isMaxReached}
                        onClick={handleStartWebcam}
                    >
                        카메라
                    </button>
                </div>
            </div>

            {/* 메인 미리보기 화면 */}
            <div style={{ height: '380px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', borderRadius: '8px' }}>
                {mediaList.length > 0 ? (
                    mediaList[choiceMediaNum].file.type.startsWith('video/') ? (
                        <video 
                            src={mediaList[choiceMediaNum].thumbnailUrl}
                            controls
                            style={{ maxWidth: '100%', maxHeight: '100%' }}
                        />
                    ) : (
                        <img
                            src={mediaList[choiceMediaNum].thumbnailUrl}
                            alt="미리보기"
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                    )
                ) : (
                    <span>이미지 및 영상을 추가해주세요.</span>
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
                            onClick={() => hasMedia && setChoiceMediaNum(index)}
                            style={{ 
                                height: '80px', 
                                backgroundColor: hasMedia ? '#fff' : '#e5e7eb', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                position: 'relative', borderRadius: '4px', cursor: hasMedia ? 'pointer' : 'default',
                                border: isChoice ? '2px solid #000' : '1px solid #ccc', 
                                overflow: 'hidden'
                            }}
                        >
                            {hasMedia ? (
                                <div>
                                    {mediaList[index].file.type.startsWith('video/') ? (
                                        <video
                                            src={mediaList[index].thumbnailUrl}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <img
                                            src={mediaList[index].thumbnailUrl}
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
                                </div>
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

export default PostMediaUploader;