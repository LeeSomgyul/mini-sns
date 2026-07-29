import Hls from 'hls.js';
import { useEffect, useRef, useState } from 'react';

interface HlsVideoPlayerProps{
    videoUrl: string;
    thumbnailUrl: string | null;
}

// [컴포넌트] 백엔드에서 넘겨주는 .m3u8 를 브라우저가 이해할 수 있도록 hls.js 라이브러리 사용하여 통역
// @param videoUrl: 미니오에서 내려준 .m3u8 주소
// @param thumbnailUrl: 영상 로딩 전 보여줄 썸네일 주소
export const HlsVideoPlayer = ({videoUrl, thumbnailUrl}: HlsVideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const centerIconTimeoutRef = useRef<number | null>(null);

    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);

    // 중앙 재생/일시정지 아이콘 오버레이 상태
    const [showCenterIcon, setShowCenterIcon] = useState(true);
    const [centerIcon, setCenterIcon] = useState<'play' | 'pause'>('play');
    const [centerAnimKey, setCenterAnimKey] = useState(0);

    //비디오 바뀔때마다 실행
    useEffect(() => {
        const video = videoRef.current;
        if(!video) return;

        if(hlsRef.current){
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        // 1.일반 브라우저 사용하는 경우(크롬, 파이어폭스 등)
        if(Hls.isSupported()){
            const hls = new Hls();
            hlsRef.current = hls;
            hls.loadSource(videoUrl);
            hls.attachMedia(video);
        }
        // 2.사파리(Safari) 사용하는 경우 (자체적으로 .m3u8을 읽을 수 있음)
        else if(video.canPlayType('application/vnd.apple.mpegurl')){
            video.src = videoUrl;
        }

        // 3.상태 정리
        return () => {
            if(hlsRef.current){
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [videoUrl]);

    // 재생 진행률 추적 (드래그 중에는 갱신하지 않음)
    useEffect(() => {
        const video = videoRef.current;
        if(!video) return;

        const handleTimeUpdate = () => {
            if(isDragging || !video.duration) return;
            setProgress((video.currentTime / video.duration) * 100);
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        return () => video.removeEventListener('timeupdate', handleTimeUpdate);
    }, [isDragging]);

    // 언마운트 시 중앙 아이콘 타이머 정리
    useEffect(() => {
        return () => {
            if(centerIconTimeoutRef.current){
                clearTimeout(centerIconTimeoutRef.current);
            }
        };
    }, []);

    //영상 터치 시 재생 및 일시정지 토클
    const handleVideoClick = () => {
        if(!videoRef.current) return;

        if(centerIconTimeoutRef.current){
            clearTimeout(centerIconTimeoutRef.current);
            centerIconTimeoutRef.current = null;
        }

        if(isPlaying){
            videoRef.current.pause();
            setIsPlaying(false);
            setCenterIcon('play');
            setShowCenterIcon(true);
            setCenterAnimKey(prev => prev + 1);
        }else{
            videoRef.current.play();
            setIsPlaying(true);
            setCenterIcon('pause');
            setShowCenterIcon(true);
            setCenterAnimKey(prev => prev + 1);

            // 재생 중에는 잠깐 튀어올랐다 사라지는 연출 후 오버레이 숨김
            centerIconTimeoutRef.current = window.setTimeout(() => {
                setShowCenterIcon(false);
            }, 600);
        }
    };

    // 프로그레스 바 클릭/드래그 위치를 기준으로 영상 탐색(seek)
    const seekToClientX = (clientX: number) => {
        const bar = progressBarRef.current;
        const video = videoRef.current;
        if(!bar || !video || !video.duration) return;

        const rect = bar.getBoundingClientRect();
        const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
        video.currentTime = ratio * video.duration;
        setProgress(ratio * 100);
    };

    const handleProgressMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDragging(true);
        seekToClientX(e.clientX);
    };

    // 드래그 중 마우스 이동/해제를 window 단위로 추적
    useEffect(() => {
        if(!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => seekToClientX(e.clientX);
        const handleMouseUp = () => setIsDragging(false);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    return(
        <div
            className="relative w-full h-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <video
                ref={videoRef}
                poster={thumbnailUrl || undefined}
                muted={isMuted}
                onClick={handleVideoClick}
                playsInline
                loop
                className="w-full h-full object-cover cursor-pointer"
            />

            {/* [오버레이] 중앙 재생/일시정지 아이콘 (유튜브 스타일) */}
            {showCenterIcon && (
                <div
                    key={centerAnimKey}
                    onClick={handleVideoClick}
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                >
                    <div
                        className={`w-16 h-16 rounded-full bg-black/45 backdrop-blur-[1px] flex items-center justify-center ${
                            isPlaying ? 'animate-center-icon-pop' : 'animate-center-icon-in'
                        }`}
                    >
                        {centerIcon === 'play' ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-7 h-7 text-white/90 ml-1"
                            >
                                <path d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-7 h-7 text-white/90"
                            >
                                <path d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75V5.25Z" />
                            </svg>
                        )}
                    </div>
                </div>
            )}

            {/* [하단 컨트롤 바] 진행바 + 음소거 버튼 (호버 시에만 노출) */}
            <div
                className={`absolute bottom-0 left-0 right-0 px-3 pb-2.5 pt-6 bg-gradient-to-t from-black/55 to-transparent transition-opacity duration-300 ${
                    isHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 음소거 버튼 */}
                <div className="flex justify-end mb-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMuted(!isMuted);
                        }}
                        aria-label={isMuted ? '소리 켜기' : '음소거'}
                        className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 transition-colors flex items-center justify-center cursor-pointer"
                    >
                        {isMuted ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.8"
                                stroke="currentColor"
                                className="w-4 h-4 text-white"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.5a.75.75 0 0 1-.75-.75V9a.75.75 0 0 1 .75-.75h2.25Z"
                                />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.8"
                                stroke="currentColor"
                                className="w-4 h-4 text-white"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.5a.75.75 0 0 1-.75-.75V9a.75.75 0 0 1 .75-.75h2.25Z"
                                />
                            </svg>
                        )}
                    </button>
                </div>
                {/* 진행바 */}
                <div
                    ref={progressBarRef}
                    onMouseDown={handleProgressMouseDown}
                    className="group/progress relative w-full h-1 hover:h-1.5 transition-[height] rounded-full bg-white/35 cursor-pointer mb-2.5"
                >
                    <div
                        className="absolute top-0 left-0 h-full rounded-full bg-[#5cc8f1]/70"
                        style={{ width: `${progress}%` }}
                    />
                    <div
                        className="absolute top-1/2 w-3 h-3 -translate-y-1/2 -translate-x-1/2 rounded-full bg-[#5cc8f1]/70 border-2 border-white shadow opacity-0 group-hover/progress:opacity-100 transition-opacity"
                        style={{ left: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};
