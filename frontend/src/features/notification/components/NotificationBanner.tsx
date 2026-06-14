interface NotificationBannerProps{
    isVisible: boolean; //hook에서 받아온 isNewFeedAvailable
    onClick: () => void;
}

export const NotificationBanner = ({isVisible, onClick}: NotificationBannerProps) => {
    // 새 게시물 없으면 '새 요청' 배너 숨김
    if(!isVisible) return null;
    
    return(
        <div
            style={{
                position: 'fixed',
                top: '20px', 
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9999, 
                
                animation: 'slideDown 0.3s ease-out',
            }}
        >
            <button
                onClick={onClick}
                className="outline"
                style={{
                    borderRadius: '20px',
                    padding: '0.6rem 1.5rem',
                    backgroundColor: 'var(--pico-background-color)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    border: '1px solid var(--pico-primary-border)',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
            >
                <span style={{ fontSize: '1.2rem' }}>🔃</span>
                새 소식
            </button>

            {/* 임시 애니메이션: '새 요청' 클릭 시 스크롤 부드럽게 올라감 */}
            <style>
                {`
                    @keyframes slideDown {
                        from {
                            transform: translate(-50%, -20px);
                            opacity: 0;
                        }
                        to {
                            transform: translate(-50%, 0);
                            opacity: 1;
                        }
                    }
                `}
            </style>
        </div>
    );
}