import { useAuthStore } from "../../auth/store/authStore";
import type { PostDto } from "../types/feedResponseType";
import { FeedActions } from "./FeedActions";
import { FeedContent } from "./FeedContent";
import { FeedHeader } from "./FeedHeader";
import { FeedMedia } from "./FeedMedia";

interface FeedCardProps{
    post: PostDto;
}

//[조립 컴포넌트] FeedHeader + FeedMedia +  FeedActions + FeedContent
export const FeedCard = ({post}: FeedCardProps) => {
    //현재 로그인한 사용자의 id
    const {myUserId} = useAuthStore();
    
    //현재 로그인한 사용자와 게시물 작성자가 동일한지 확인
    const isAuthor = myUserId !== null && post.author.userId === myUserId;

    return(
        <article style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid var(--pico-table-border-color)', borderRadius: 'var(--pico-border-radius)' }}>
            <FeedHeader
                author={post.author}
                createdAt={post.createdAt}
                isAuthor={isAuthor}
            />
            <FeedMedia mediaList={post.media}/>
            <FeedActions likeCount={post.likeCount} commentCount={post.commentCount}/>
            <FeedContent content={post.content}/>
        </article>
    );
};