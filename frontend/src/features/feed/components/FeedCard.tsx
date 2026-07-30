import { useAuthStore } from "../../auth/store/authStore";
import type { PostDto } from "../types/feedResponseType";
import { FeedActions } from "./FeedActions";
import { FeedContent } from "./FeedContent";
import { FeedHeader } from "./FeedHeader";
import { FeedMedia } from "./FeedMedia";

interface FeedCardProps{
    post: PostDto;
    onDeleteSuccess?: () => void;
}

//[조립 컴포넌트] FeedHeader + FeedMedia +  FeedActions + FeedContent
export const FeedCard = ({post, onDeleteSuccess}: FeedCardProps) => {
    //현재 로그인한 사용자의 id
    const {myUserId} = useAuthStore();
    
    //현재 로그인한 사용자와 게시물 작성자가 동일한지 확인
    const isAuthor = myUserId !== null && post.author.userId === myUserId;

    return(
        <article className="flex flex-col gap-3 rounded-3xl border border-white/60 bg-white/90 backdrop-blur-xl shadow-[0_5px_10px_rgba(30,30,45,0.07)] p-5 overflow-hidden">
            <FeedHeader
                postId={post.postId}
                author={post.author}
                createdAt={post.createdAt}
                isAuthor={isAuthor}
                onDeleteSuccess={onDeleteSuccess}
            />
            <FeedMedia mediaList={post.media}/>
            <FeedActions 
                postId={post.postId}
                isLiked={post.isLiked}
                likeCount={post.likeCount}
                commentCount={post.commentCount}
            />
            <FeedContent content={post.content}/>
        </article>
    );
};