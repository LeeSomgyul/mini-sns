import { useEffect, useState, useRef } from "react";
import { useQueryClient } from '@tanstack/react-query';
import type { MediaDto } from "../types/feedResponseType";
import { HlsVideoPlayer } from "./HlsVideoPlayer";
import { FEED_KEYS } from "../../../constants/queryKey";

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

    const queryClient = useQueryClient();
    const intervalRef = useRef<number | null>(null);
    const currentMedia = mediaList[currentIndex];
    const isMulti = mediaList.length>1;
    const isProcessing = currentMedia.status === 'PROCESSING';


    //다른 사진으로 넘어가면, 에러 화면을 정상 화면으로 초기화
    useEffect(() => {

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        //백엔드 Go워커에서 미디어가 비동기 처리중이라면...
        if(isProcessing){
            intervalRef.current = window.setInterval(() => {
                queryClient.invalidateQueries({
                    queryKey: FEED_KEYS.all,
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

    if(!mediaList || mediaList.length === 0) return null;

    //[버튼] 이미지 재시도 
    const handleRetry = () => {
        setHasError(false);
        setRetryKey(prev => prev + 1);
    };

    return(
        <div
            className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* 1. 백엔드에서 미디어를 비동기로 처리중일 때 */}
            {isProcessing ? (
                <div className="relative w-full h-full">
                    {currentMedia.mediaUrl && (
                        <img
                            src={currentMedia.mediaUrl}
                            alt="업로드 최적화 대기 중"
                            className="w-full h-full object-cover"
                            style={{ filter: 'blur(4px) brightness(0.6)' }}
                        />
                    )}

                    {/* [오버레이 UI] 미리보기 위에 겹쳐서 진행 상황을 알려주는 스피너 레이어 */}
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-white bg-black/20">
                        <div className="text-4xl mb-2 animate-spin">⚙️</div>
                        <p className="m-0 text-sm font-bold [text-shadow:1px_1px_4px_rgba(0,0,0,0.8)]">
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
                        <div className="relative w-full h-full overflow-hidden">
                            <img
                                src={`${currentMedia.mediaUrl}?retry=${retryKey}`}
                                alt="게시물 미디어"
                                crossOrigin="anonymous"
                                className="w-full h-full object-cover"
                                onError={() => setHasError(true)}
                            />
                        </div>
                    ) : (
                        //이미지 로드 실패 시
                        <div className="relative w-full h-full">
                            <img
                                src={ERROR_FALLBACK_IMAGE}
                                alt="에러 기본 이미지"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/50">
                                <p className="text-white m-0 mb-3 text-sm">
                                    이미지를 불러올 수 없습니다.
                                </p>
                                <button
                                    onClick={handleRetry}
                                    className="text-white border border-white rounded-lg px-3 py-1.5 text-xs cursor-pointer hover:bg-white/10 transition-colors"
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
                            className="absolute top-1/2 left-2.5 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 border-0 cursor-pointer hover:bg-white/90 transition-colors"
                        >
                            ⬅️
                        </button>
                    )}
                    {currentIndex < mediaList.length - 1 && (
                        <button
                            onClick={() => setCurrentIndex(prev => prev + 1)}
                            className="absolute top-1/2 right-2.5 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 border-0 cursor-pointer hover:bg-white/90 transition-colors"
                        >
                            ➡️
                        </button>
                    )}
                </>
            )}

            {/* 3. 하단 중앙 인디케이터 */}
            {isMulti && (
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {mediaList.map((_,idx) => (
                        <div
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-2 h-2 rounded-full cursor-pointer ${
                                idx === currentIndex ? 'bg-[#5cc8f1]' : 'bg-white/50 border border-white'
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};