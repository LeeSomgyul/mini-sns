interface ProfileMediaGridProps {
  thumbnails: string[];
  onThumbnailSelect: (url: string) => void; 
}

// [프로필 우측 하단] 게시물 썸네일 그리드
export const ProfileMediaGrid = ({ thumbnails, onThumbnailSelect }: ProfileMediaGridProps) => {
  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
      {thumbnails.map((url, idx) => (
        <div 
          key={idx} 
          style={{ aspectRatio: '1 / 1', backgroundColor: 'var(--pico-muted-color)', cursor: 'pointer' }}
          onClick={() => onThumbnailSelect(url)}
        >
          <img 
            src={url} 
            alt={`게시물 썸네일 ${idx}`} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>
      ))}
    </div>
  );
};