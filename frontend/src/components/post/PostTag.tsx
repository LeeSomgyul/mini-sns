//Post (게시물작성, 우측 하단): 태그 추가 및 태그 리스트
import type { Dispatch, SetStateAction } from 'react';
import type{ TagUserType } from '../../types/post/TagUserType';


interface PostTagProps {
    tagUsers: TagUserType[];
    setTagUsers: Dispatch<SetStateAction<TagUserType[]>>;
};

const PostTag = ({tagUsers, setTagUsers}: PostTagProps) => {

    //[태그 추가] 🚨🚨임시 작성🚨🚨
    const handleAddTag = () => {
        const newUser: TagUserType = {
            userId: Math.floor(Math.random() * 1000),
            nickname: `유저${tagUsers.length + 1}`,
            name: `이름${tagUsers.length + 1}`
        };

        setTagUsers(prev => [...prev, newUser]);//새로운 유저 업데이트
    };

    //[태그된 유저 삭제]
    const handleRemoveTag = (userId: number) => {
        setTagUsers(prev => prev.filter(user => user.userId !== userId));
    };

    return(
        <div>
            <h4 style={{ marginBottom: '0.5rem' }}>태그</h4>
            <button 
                className="secondary outline" 
                style={{ width: '100%', marginBottom: '0.7rem' }}
                onClick={handleAddTag}
            >
                태그 추가
            </button>
            
            {/* 태그된 유저 리스트 */}
            <div>
                {tagUsers.map((user) => (
                    <article
                        key={user.userId}
                        style={{ padding: '0.5rem 1rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                        <div>
                            {/* 임시 유저 정보 (프로필 이미지, 닉네임, 이름) */}
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#d1d5db' }}></div>
                            <span>{user.nickname}</span>
                            <span>{user.name}</span>
                        </div>
                        <button
                            type="button"
                            className="secondary outline" 
                            style={{ margin: 0, padding: '0.2rem 0.5rem', width: 'auto', fontSize: '0.8rem' }}
                            onClick={() => handleRemoveTag(user.userId)}   
                        >
                            삭제
                        </button>
                    </article>
                ))}
            </div>
        </div>
    );
};

export default PostTag;