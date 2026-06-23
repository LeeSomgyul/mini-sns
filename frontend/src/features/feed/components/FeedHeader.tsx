import type {AuthorDto} from "../types/feedResponseType";
import { formatFeedDate } from "../hooks/formatFeedDate";
import { useDeletePost } from "../../post/hooks/useDeletePost";

interface FeedHeaderProps {
    postId: number;
    author: AuthorDto;
    createdAt: string;
    isAuthor: boolean;
    openEditModal: (postId: number) => void;
}

//[컴포넌트] 피드 카드 상단의 '작성자 정보' 및 '수정 and 삭제' 버튼 영역 
//@param {FeedHeaderProps} props - 작성자 정보, 작성 시간, 본인 여부
export const FeedHeader = ({ postId, author, createdAt, isAuthor, openEditModal }: FeedHeaderProps) => {

    const DEFAULT_PROFILE = `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image.png`;

    const {mutate: deletePost, isPending} = useDeletePost();

    // [삭제 버튼 클릭]
    const handleDeletePost = () => {
        const isConfirmed = window.confirm("게시물을 삭제할까요?\n삭제 후 복구할 수 없습니다.");

        if(isConfirmed){
            deletePost(postId);
        }
    };

    // [수정 버튼 클릭]
    const handleUpdatePost = () => {
        openEditModal(postId);
    };

    return(
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            {/* 왼쪽: 프로필 및 정보 */}
            <div
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                onClick={() => alert(`${author.userId} 프로필로 이동`)} //🚨프로필 기능 완성 후 링크 연결🚨
            >
                <img
                    src={author.profileImageUrl || DEFAULT_PROFILE}
                    alt={`${author.nickname} 프로필`}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                    onError={(e) => {e.currentTarget.src = DEFAULT_PROFILE}}
                />
                <div>
                    <div style={{ display: 'block', lineHeight: 1.2 }}>
                        {author.nickname}
                    </div>
                    <div style={{ color: 'var(--pico-muted-color)' }}>
                        {formatFeedDate(createdAt)}
                    </div>
                </div>
            </div>

            {/* 오른쪽: 내 글일 경우에만 수정 and 삭제 버튼 노출 */}
            {isAuthor && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className="outline secondary"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                        onClick={handleUpdatePost}
                    >
                        수정
                    </button>
                    <button
                        className="outline secondary"
                        onClick={handleDeletePost}
                        disabled={isPending}
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                    >
                        {isPending ? '⌛' : '삭제'}
                    </button>
                </div>
            )}
        </header>
    );
};