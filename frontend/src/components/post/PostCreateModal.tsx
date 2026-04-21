//Post (게시물 작성) 모달 전체 상태 관리 및 API 전송
import { useState } from "react";
import PostMediaUploader from "./PostMediaUploader";
import PostDescription from "./PostDescription";
import PostTag from "./PostTag";
import type { TagUser } from "../../types/post/TagUser";

interface PostCreateModalProps{
    closeModal: () => void;
}

const PostCreateModal = ({closeModal}: PostCreateModalProps) => {

    const [mediaList, setMediaList] = useState<string[]>([]);//이미지 미리보기
    const [choiceMediaNum, setChoiceMediaNum] = useState<number>(0);//현재 미리보기로 보고있는 미디어 번호
    const [content, setContent] = useState<string>('');//게시글 내용
    const [tagUsers, setTagUsers] = useState<TagUser[]>([]);//태그된 유저 목록

    //[저장 버튼] 클릭 시 게시물 저장 실행
    const handleSave = () => {

    };

    return(
        <div>
            <dialog open>
                <article style={{ width: '90vw', maxWidth: '1000px' }}>
                    <header>
                        {/* 우측 상단 삭제 버튼 */}
                        <button aria-label="Close" className="close" onClick={closeModal}></button>
                        <h2>피드 작성</h2>
                    </header>

                    {/* 좌우 분할 그리드 */}
                    <div className="grid">
                        {/* 왼쪽: 미디어 */}
                        <div>
                            <PostMediaUploader
                                mediaList={mediaList}
                                setMediaList={setMediaList}
                                choiceMediaNum={choiceMediaNum}
                                setChoiceMediaNum={setChoiceMediaNum}
                            />
                        </div>
                        {/* 오른쪽: 글 작성 + 태그 */}
                        <div>
                            <PostDescription content={content} setContent={setContent}/>
                            <PostTag tagUsers={tagUsers} setTagUsers={setTagUsers}/>
                        </div>
                    </div>
                    <footer>
                        <button className="secondary" onClick={closeModal}>작성 취소</button>
                        <button onClick={handleSave}>저장</button>
                    </footer>
                </article>
            </dialog>
        </div>
    );
};

export default PostCreateModal;