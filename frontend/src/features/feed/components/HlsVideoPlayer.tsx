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
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);

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

    //영상 터치 시 재생 및 일시정지 토클
    const handleVideoClick = () => {
        if(!videoRef.current) return;
        if(isPlaying){
            videoRef.current.pause();
        }else{
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    return(
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <video
                ref={videoRef}
                poster={thumbnailUrl || undefined}
                muted={isMuted}
                onClick={handleVideoClick}
                playsInline
                loop
                style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
            />

            {/* 우측 하단 음소거 해제 버튼 */}
            <button 
                onClick={(e) => { 
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                }}
                style={{ position: 'absolute', bottom: '10px', right: '10px', padding: '0.2rem 0.5rem', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '4px' }}
            >
                {isMuted ? '🔇 음소거' : '🔊 소리 켬'}
            </button>
        </div>
    );
};