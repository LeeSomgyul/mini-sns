import { useNavigate } from "react-router-dom";
import { useFeedTags } from "../hooks/useFeedTags";
import { ROUTES } from "../../../constants/routes";

interface FeedTagModalProps {
    postId: number;
    isOpen: boolean;
    onClose: () => void;
}

export const FeedTagModal = ({postId, isOpen, onClose}: FeedTagModalProps) => {

    const DEFAULT_PROFILE = `${import.meta.env.VITE_MINIO_DEFAULT_URL}/default_profile_image.png`;

    const navigate = useNavigate();
    const { taggedUsers, isLoading } = useFeedTags(postId, isOpen);

    if(!isOpen) return null;

    const handleUserClick = (userId: number) => {
        onClose();
        navigate(ROUTES.PROFILE.LINK(userId));
    };

    return(
        <dialog open onClick={onClose}>
            <article 
                onClick={(e) => e.stopPropagation()} 
                style={{ width: '100%', maxWidth: '400px', padding: '0' }}
            >
                {/* 헤더: 태그 헤더, 닫기 버튼 */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>태그</h3>
                    <button 
                        aria-label="Close" 
                        rel="prev" 
                        onClick={onClose}
                        style={{ margin: 0, border: 'none', background: 'transparent', color: "black" }}
                    >
                        ✕
                    </button>
                </header>

                {/* 태그 리스트 영역 (스크롤 처리) */}
                <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '1rem 0' }}>
                    {isLoading ? (
                        <div aria-busy="true" style={{ textAlign: 'center', padding: '2rem 0' }}>
                            데이터를 불러오는 중...
                        </div>
                    ) : taggedUsers.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--pico-muted-color)', padding: '2rem 0' }}>
                            태그된 사용자가 없습니다.
                        </div>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {taggedUsers.map((user) => {
                                const finalImage = user.profileImageUrl !== null
                                        ? user.profileImageUrl
                                        : DEFAULT_PROFILE;
                                console.log("결과", user.profileImageUrl);
                                return(
                                    <li 
                                    key={user.userId} 
                                    onClick={() => handleUserClick(user.userId)}
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        padding: '0.8rem 1.5rem', 
                                        cursor: 'pointer',
                                        borderBottom: '1px solid var(--pico-table-border-color)'
                                    }}
                                >
                                    <img 
                                        src={finalImage} 
                                        alt={`${user.nickname} 프로필`} 
                                        style={{ 
                                            width: '44px', 
                                            height: '44px', 
                                            borderRadius: '50%', 
                                            objectFit: 'cover', 
                                            marginRight: '1rem' 
                                        }}
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <strong style={{ fontSize: '1rem', color: 'var(--pico-h1-color)' }}>
                                            {user.nickname}
                                        </strong>
                                        <small style={{ fontSize: '0.85rem', color: 'var(--pico-muted-color)' }}>
                                            {user.name}
                                        </small>
                                    </div>
                                </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </article>
        </dialog>
    );
};