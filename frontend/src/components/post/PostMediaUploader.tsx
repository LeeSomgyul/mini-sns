//Post (게시물작성, 좌측): 미디어 추가, 미리보기, 썸네일 5칸
import type { Dispatch, SetStateAction } from 'react';

interface PostMediaUploaderProps {
    mediaList: string[];
    setMediaList: Dispatch<SetStateAction<string[]>>;
    choiceMediaNum: number;
    setChoiceMediaNum: Dispatch<SetStateAction<number>>;
}

const PostMediaUploader = ({mediaList, setMediaList, choiceMediaNum, setChoiceMediaNum}: PostMediaUploaderProps) => {
    
    //[추가 버튼] 클릭 시 미디어 추가
    const handleAddMedia = () => {
        if(mediaList.length>=5){
            return alert('최대 5개까지만 업로드 가능합니다.');
        }

        setMediaList([...mediaList, `https://via.placeholder.com/150?text=Image+${mediaList.length + 1}`]);
    };

    //[웹캠 버튼] 클릭 시 웹캠 실행
    const handleStartWebcam = () => {

    };

    //[미리보기 제거] 클릭 시 선택했던 미디어 제거
    const handleRemoveMedia = (indexToRemove: number) => {
        setMediaList(mediaList.filter((_, index) => index !== indexToRemove));
        if(choiceMediaNum == indexToRemove) setChoiceMediaNum(0); //지운 이미지가 현재 보고있는 이미지라면 0번으로 초기화
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
                    <button 
                        className="secondary outline"
                        style={{ marginRight: '8px', padding: '0.5rem' }}
                        onClick={handleAddMedia}
                    >
                        추가
                    </button>
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
                    <img src={mediaList[choiceMediaNum]} alt="메인 미리보기" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}/>
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
                                    <img src={mediaList[index]} alt={`썸네일 ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                                    <button
                                        className="close"
                                        onClick={(e) => {e.stopPropagation(); handleRemoveMedia(index);}}
                                    >
                                    </button>                                
                                </div>
                            ) : (
                                <span style={{ color: '#9ca3af' }}>+</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PostMediaUploader;