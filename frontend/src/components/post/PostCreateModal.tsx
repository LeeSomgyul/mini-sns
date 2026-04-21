//Post (게시물 작성) 모달 전체 상태 관리 및 API 전송
import { useState } from "react";
import PostMediaUploader from "./PostMediaUploader";
import PostDescription from "./PostDescription";
import PostTag from "./PostTag";
import type { TagUserType } from "../../types/post/TagUserType";
import postApi from "../../api/postApi";
import type { SelectedMediaType } from "../../types/post/SelectedMediaType";

interface PostCreateModalProps{
    closeModal: () => void;
}

const PostCreateModal = ({closeModal}: PostCreateModalProps) => {

    const [mediaList, setMediaList] = useState<SelectedMediaType[]>([]);//이미지 미리보기
    const [choiceMediaNum, setChoiceMediaNum] = useState<number>(0);//현재 미리보기로 보고있는 미디어 번호
    const [content, setContent] = useState<string>('');//게시글 내용
    const [tagUsers, setTagUsers] = useState<TagUserType[]>([]);//태그된 유저 목록

    const [isUploading, setIsUploading] = useState(false);

    //[저장 버튼] 클릭 시 게시물 저장 실행
    const handleSave = async () => {
        if(!content.trim()) return alert('내용을 입력해주세요.');
        const uploadedMediaInfo = [];

        //미디어 파일들을 하나씩 MiniO에 업로드
        for(const item of mediaList){
            const {file} = item;
            
            //백엔드에서 presignedUrl, objectKey 받아오기
            const {presignedUrl, objectKey} = await postApi.getPresignedUrl({
                filename: file.name,
                fileType: file.type.startsWith('video') ? 'VIDEO' : 'IMAGE'
            });

            //presignedUrl, objectKey 사용하여 MiniO에 데이터 저장
            await postApi.uploadToMinio(presignedUrl, file);

            //백엔드로 보낼 완성된 데이터 모으기
            uploadedMediaInfo.push({
                mediaUrl: objectKey,
                thumbnailUrl: "/minio/mini-sns-default/default_loading_image.png",//🚨🚨예시로 기본 이미지🚨🚨
                mediaType: file.type.startsWith('video') ? 'VIDEO' : 'IMAGE'
            });
        }

        try{
            setIsUploading(true);

        }catch(error){

        }finally{
            setIsUploading(false);
        }
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