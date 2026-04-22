import { useEffect, useRef, useState } from "react";
import toast from 'react-hot-toast';

import PostMediaUploader from "./PostMediaUploader";
import PostDescription from "./PostDescription";
import PostTag from "./PostTag";
import postApi from "../../api/postApi";
import { extractVideoThumbnail, extractImageThumbnail } from "../../utils/extractThumbnail";

import type { TagUserType } from "../../types/post/TagUserType";
import type { SelectedMediaType } from "../../types/post/SelectedMediaType";
import type { MediaUploadRequest } from "../../api/postApi";

interface PostCreateModalProps{
    closeModal: () => void;
}

//Post (게시물 작성) 모달 전체 상태 관리 및 API 전송
const PostCreateModal = ({closeModal}: PostCreateModalProps) => {

    const [mediaList, setMediaList] = useState<SelectedMediaType[]>([]);//미디어 미리보기
    const [choiceMediaNum, setChoiceMediaNum] = useState<number>(0);//현재 미리보기로 보고있는 미디어 번호
    const [content, setContent] = useState<string>('');//게시글 내용
    const [tagUsers, setTagUsers] = useState<TagUserType[]>([]);//태그된 유저 목록

    const [isUploading, setIsUploading] = useState(false);

    const mediaRef = useRef(mediaList);//최신 미디어 리스트

    //미디어 리스트 바뀔때마다 최신 리스트로 업데이트
    useEffect(() => {
        mediaRef.current = mediaList;
    }, [mediaList]);

    //x창 누를때 미디어 미리보기 메모리 청소
    useEffect(() => {
        return()=>{
            mediaRef.current.forEach(media => {
                if(media.thumbnailUrl){
                    URL.revokeObjectURL(media.thumbnailUrl);
                }
            });
        };
    }, []);

    //[메서드] 원본 파일 타입 소문자 -> 대문자 변환
    const getFileTypeEnum = (mediaType: string) => {
        if(mediaType.startsWith('video/'))return 'VIDEO';
        return 'IMAGE';
    };

    //[메서드] 백엔드(PresignedUrlRequest)로 파일과 타입을 주면 -> presignedUrl, objectKey 응답
    const presignedUrlRequest = async(file: File, type: 'IMAGE' | 'VIDEO' | 'THUMBNAIL') => {
        const {presignedUrl, objectKey} = await postApi.getPresignedUrl({
            filename: file.name,
            fileType: type
        });

        await postApi.uploadToMinio(presignedUrl, file);

        return objectKey;
    };

    //[저장 버튼] 클릭 시 게시물 저장 실행
    const handleSave = async () => {

        if(mediaList.length === 0){
            toast.error('이미지 또는 영상을 1개 이상 등록해주세요.');
            return;
        }

        if(!content.trim()) {
            toast.error('내용을 입력해주세요.');
            return;
        }


        try{
            setIsUploading(true);

            const uploadedMediaInfo: MediaUploadRequest[] = [];

            //미디어 파일들을 하나씩 MiniO에 업로드
            for(const item of mediaList){
                const {file} = item;

                const backendFileType = getFileTypeEnum(file.type);
                const thumbnailFile = await (backendFileType === 'VIDEO'
                    ? extractVideoThumbnail(file)
                    : extractImageThumbnail(file)
                );

                //원본, 썸네일 동시 업로드
                const [mediaUrl, thumbnailUrl] = await Promise.all([
                    presignedUrlRequest(file, backendFileType),
                    presignedUrlRequest(thumbnailFile, 'THUMBNAIL')
                ]);

                //백엔드로 보낼 완성된 데이터 모으기
                uploadedMediaInfo.push({
                    mediaUrl: mediaUrl, //원본파일에 대한 objectKey
                    thumbnailUrl: thumbnailUrl, //썸네일에 대한 objectKey
                    mediaType: backendFileType
                });
            }

            //PostRequest에 맞게 전송(DB에 최종 저장)
            const postRequest = {
                mediaList: uploadedMediaInfo,
                content: content,
                tagUserIds: tagUsers.map(user => user.userId)
            };

            await postApi.createPost(postRequest);

            toast.success('게시물이 등록되었습니다!');
            closeModal();
            
        }catch(error){
            console.log("업로드 실패: ", error);
            toast.error('업로드 중 오류가 발생했습니다. 다시 시도해주세요.');
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
                        <button onClick={handleSave}>저장</button>
                    </footer>
                </article>
            </dialog>
        </div>
    );
};

export default PostCreateModal;