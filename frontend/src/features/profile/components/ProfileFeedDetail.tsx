import { FeedCard } from "../../feed/components/FeedCard";
import { useFeedDetail } from "../../feed/hooks/useFeedDetail";

interface ProfileFeedDetailProps {
    postId: number | null;
}

// 우측 게시물 썸네일 클릭 시 -> 게시물 단건 조회
export const ProfileFeedDetail = ({postId}: ProfileFeedDetailProps) => {

    const {
        data: post,
        isLoading, 
        isError
    } = useFeedDetail(postId);

    // 1. 작성된 게시물이 없을 경우
    if(!postId){
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--pico-muted-color)' }}>
                작성된 게시물이 없습니다.
            </div>
        );
    }

    // 2. 게시물 데이터를 가져오고 있을 때
    if(isLoading){
        return(
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <div aria-busy="true">게시물 불러오는 중...</div>
            </div>
        );
    }

    // 3. 에러 발생
    if(isError || !post){
        return(
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--pico-del-color)' }}>
                게시물을 불러오지 못했습니다.
            </div>
        );
    }

    return(
        <article style={{ margin: 0, height: '100%', overflowY: 'auto' }}>
            <FeedCard post={post} />
        </article>
    );
};