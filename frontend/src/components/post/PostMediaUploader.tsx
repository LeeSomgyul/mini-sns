import { useRef, type Dispatch, type SetStateAction } from 'react';
import type { SelectedMediaType } from '../../types/post/SelectedMediaType';

interface PostMediaUploaderProps {
    mediaList: SelectedMediaType[];
    setMediaList: Dispatch<SetStateAction<SelectedMediaType[]>>;
    choiceMediaNum: number;
    setChoiceMediaNum: Dispatch<SetStateAction<number>>;
}

//Post (게시물작성, 좌측): 미디어 추가, 미리보기, 썸네일 5칸
const PostMediaUploader = ({mediaList, setMediaList, choiceMediaNum, setChoiceMediaNum}: PostMediaUploaderProps) => {
    
    const fileInputRef = useRef<HTMLInputElement>(null);//미디어 추가 버튼에서 숨겨진 file input 조종


    //[추가 버튼] 클릭 시 파일 추가 input 실행
    const handleAddMedia = () => {
        if(mediaList.length>=5){
            return alert('최대 5개까지만 업로드 가능합니다.');
        }
        fileInputRef.current?.click();
    };

    //[파일 추가] 사용자가 파일을 선택했을 때 실행됨
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if(!files || files.length === 0) return;

        const newFile = files[0];//🚨🚨일단 1개씩 추가한다고 가정, 여러개 동시 추가 가능으로 바꾸기🚨🚨
        const thumbnailUrl = URL.createObjectURL(newFile);

        setMediaList(prev => [...prev, {file: newFile, thumbnailUrl: thumbnailUrl}]);

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
                    <small style={{ fontSize: '1rem' }}>(0/5)</small>
                </div>
                <div>
                    {/* 미디어 추가 버튼 */}
                    <div>
                        <input
                            type="file"
                            accept="image/*, video/*"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                        <button 
                            className="secondary outline"
                            style={{ marginRight: '8px', padding: '0.5rem' }}
                            onClick={handleAddMedia}
                        >
                            추가
                        </button>
                    </div>
                    {/* 웹캠 실행 버튼 */}
                    <button 
                        className="secondary outline"
                        style={{ padding: '0.5rem' }}
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