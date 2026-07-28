interface NotificationBannerProps{
    isVisible: boolean; //hook에서 받아온 isNewFeedAvailable
    onClick: () => void;
}

export const NotificationBanner = ({isVisible, onClick}: NotificationBannerProps) => {
    // 새 게시물 없으면 '새 요청' 배너 숨김
    if(!isVisible) return null;
    
    return(
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] animate-slide-down">
            <button
                onClick={onClick}
                className="flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-xl border border-white/60 px-6 py-2.5 font-bold text-[#2b2b31] shadow-[0_4px_12px_rgba(0,0,0,0.15)] cursor-pointer hover:bg-white transition-colors"
            >
                <span className="text-xl">🔃</span>
                새 소식
            </button>
        </div>
    );
}