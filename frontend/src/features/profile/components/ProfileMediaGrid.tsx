import { useEffect, useRef } from "react";

interface ProfileThumbnail {
  postId: number;
  thumbnailUrl: string;
}

interface ProfileMediaGridProps {
  thumbnails: ProfileThumbnail[];
  onThumbnailSelect: (postId: number) => void; 
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

// [프로필 우측 하단] 게시물 썸네일 그리드
export const ProfileMediaGrid = ({
  thumbnails,
  onThumbnailSelect,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
}: ProfileMediaGridProps) => {

  // [무한스크롤] 바닥 감지 센서
  const observierRef = useRef<HTMLDivElement>(null);  

  useEffect(() => {
    // 1. 감시 센서 생성
    const observer = new IntersectionObserver(
      (entries) => {
        // entries[0]: 무한스크롤 투명 센서의 현재 상태 정보
        // hasNextPage: 서버에 아직 안 가져온 다음 페이지가 더 남아있고
        // isFetchingNextPage: 지금 다음 페이지를 가져오고 있지 않다면
        if(entries[0].isIntersecting && hasNextPage && !isFetchingNextPage){
          // 다음 페이지 데이터 가져오기 실행
          fetchNextPage();
        }
      },
      {threshold: 0.5}
    );

    // 2. 감시할 대상(div)이 존재하면 해당 대상 쳐다보기
    if(observierRef.current){
      observer.observe(observierRef.current);
    }

    // 3. 메모리 누수 방지
    return () => {
      if(observierRef.current){
        observer.unobserve(observierRef.current);
      }
    };

  },[fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
        {thumbnails.map((thumb, idx) => (
          <div 
            key={idx} 
            style={{ aspectRatio: '1 / 1', backgroundColor: 'var(--pico-muted-color)', cursor: 'pointer' }}
            onClick={() => onThumbnailSelect(thumb.postId)}
          >
            <img 
              src={thumb.thumbnailUrl} 
              alt={`게시물 썸네일 ${idx}`} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
        ))}
      </div>

      {/* 무한스크롤 바닥 감지 센서 */}
      <div 
        ref={observierRef}
        style={{ height: '20px', margin: '1rem 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
          {isFetchingNextPage &&
            <div aria-busy="true"></div>
          }
      </div>
    </>
  );
};