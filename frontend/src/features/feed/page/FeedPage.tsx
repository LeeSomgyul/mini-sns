import { FEED_KEYS } from "../../../constants/queryKey";
import { NotificationBanner } from "../../notification/components/NotificationBanner";
import { useNewFeedNotification } from "../../notification/hooks/useNewFeedNotification";
import { FeedList } from "../components/FeedList";
import { useQueryClient } from '@tanstack/react-query';

interface FeedPageProps{
    onRefreshScroll: () => void;
}

// [새 요청 + 피드 리스트]
export const FeedPage = ({onRefreshScroll}: FeedPageProps) => {

    const queryClient = useQueryClient();

    // 2.새요청 배너 훅 가져오기
    const {isNewFeedAvailable, resetNotification} = useNewFeedNotification();

    // 3.새요청 클릭 시 기존 요청 상태 초기화
    const handleRefresh = async() => {
        resetNotification();

        //스크롤 위로 올리기
        onRefreshScroll();

        //캐시 파괴 및 새로고침
        await queryClient.invalidateQueries({
            queryKey: FEED_KEYS.lists(20),
        });        
    }

    return (
        <div>
            <NotificationBanner
                isVisible={isNewFeedAvailable}
                onClick={handleRefresh}
            />
            <FeedList/>
        </div>
    );
}