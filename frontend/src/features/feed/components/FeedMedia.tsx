import { useEffect, useState, useRef } from "react";
import { useQueryClient } from '@tanstack/react-query';
import type { MediaDto } from "../types/feedResponseType";
import { HlsVideoPlayer } from "./HlsVideoPlayer";

interface FeedMediaProps{
    mediaList: MediaDto[];
}

//[컴포넌트] 피드 카드의 미디어 공간
//@param mediaList: 이미지, 비디오가 섞인 미디어 배열
export const FeedMedia = ({mediaList}: FeedMediaProps) => {

    const ERROR_FALLBACK_IMAGE = `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_loading_image.png`;
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const [hasError, setHasError] = useState(false);
    const [retryKey, setRetryKey] = useState(0);

    if(!mediaList || mediaList.length === 0) return null;

    const queryClient = useQueryClient();
    const intervalRef = useRef<number | null>(null);
    const currentMedia = mediaList[currentIndex];
    const isMulti = mediaList.length>1;
    const isProcessing = currentMedia.status === 'PROCESSING';


    //다른 사진으로 넘어가면, 에러 화면을 정상 화면으로 초기화
    useEffect(() => {
        setHasError(false);

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        //백엔드 Go워커에서 미디어가 비동기 처리중이라면...
        if(isProcessing){
            intervalRef.current = window.setInterval(() => {
                queryClient.invalidateQueries({
                    queryKey: ["feeds"],
                    exact: false
                });
            },3000);
        }

        return() => {
            if(intervalRef.current){
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    },[isProcessing, queryClient]);

    //[버튼] 이미지 재시도 
    const handleRetry = () => {
        setHasError(false);
        setRetryKey(prev => prev + 1);
    };

    return(
        <div
            style={{ position: 'relative', width: '100%', aspectRatio: '1/1', backgroundColor: '#000' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* 1. 백엔드에서 미디어를 비동기로 처리중일 때 */}
            {isProcessing ? (
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    {currentMedia.mediaUrl && (
                        <img 
                            src={currentMedia.mediaUrl} 
                            alt="업로드 최적화 대기 중" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(4px) brightness(0.6)' }} 
                        />
                    )}

                    {/* [오버레이 UI] 미리보기 위에 겹쳐서 진행 상황을 알려주는 스피너 레이어 */}
                    <div style={{
                        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', 
                        justifyContent: 'center', alignItems: 'center', color: 'white', backgroundColor: 'rgba(0,0,0,0.2)'
                    }}>
                        <div className="loading-spinner" style={{ fontSize: '2.2rem', marginBottom: '0.6rem', animation: 'spin 2s linear infinite' }}>⚙️</div>
                        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold', textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
                            미디어 업로드중...
                        </p>
                    </div>
                </div>
            ) : (
                /* 2. 백엔드 처리 완료(COMPLETED)되어 진짜 미디어를 보여주는 구역 */
                currentMedia.type === 'VIDEO' ? (
                    <HlsVideoPlayer
                        videoUrl={currentMedia.mediaUrl}
                        thumbnailUrl={currentMedia.thumbnailUrl}
                    />
                ) : (
                    !hasError ? (
                        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
                            <img
                                src={`${currentMedia.mediaUrl}?retry=${retryKey}`}
                                alt="게시물 미디어"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={() => setHasError(true)}
                            />
                        </div>
                    ) : (
                        //이미지 로드 실패 시
                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                            <img
                                src={ERROR_FALLBACK_IMAGE}
                                alt="에러 기본 이미지"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                                <p style={{ color: 'white', margin: 0, marginBottom: '0.8rem', fontSize: '0.9rem' }}>
                                    이미지를 불러올 수 없습니다.
                                </p>
                                <button
                                    onClick={handleRetry}
                                    className="outline" 
                                    style={{ color: 'white', borderColor: 'white', padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
                                >
                                    🔄 다시 시도
                                </button>
                            </div>
                        </div>
                    )
                )
            )}

            {/* 2. 다중 미디어일 때 화살표 컨트롤 (호버 시에만 노출) */}
            {isMulti && isHovered && (
                <>
                    {currentIndex > 0 && (
                        <button
                            onClick={() => setCurrentIndex(prev => prev - 1)}
                            style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}
                        >
                            ⬅️
                        </button>
                    )}
                    {currentIndex < mediaList.length - 1 && (
                        <button 
                            onClick={() => setCurrentIndex(prev => prev + 1)}
                            style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}
                        >
                            ➡️
                        </button>
                    )}
                </>
            )}

            {/* 3. 하단 중앙 인디케이터 */}
            {isMulti && (
                <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
                    {mediaList.map((_,idx) => (
                        <div
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            style={{
                                width: '8px', height: '8px', borderRadius: '50%', cursor: 'pointer',
                                backgroundColor: idx === currentIndex ? '#007BFF' : 'rgba(255,255,255,0.5)',
                                border: idx === currentIndex ? 'none' : '1px solid white'
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};