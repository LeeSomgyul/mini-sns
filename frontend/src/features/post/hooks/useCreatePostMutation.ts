import { type InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from 'react-hot-toast';
import { postApi } from "../api/postApi";
import type { PostFormValues } from "../schemas/postSchema";
import type { postResponse} from "../types/postTypes";
import type { AxiosError } from "axios";
import { useAuthStore } from "../../auth/store/authStore";
import type { PostDto } from "../../feed/types/feedResponseType";


interface UseCreatePostProps {
    closeModal: () => void;
    size?: number;
}

// [백엔드로 데이터 최종 전송]
// 리엑트 훅 폼에 모인 uppy가 등록한 파일 정보 + 크롭 데이터를 백엔드로 전달
export const useCreatePostMutation = ({ closeModal, size=10 }: UseCreatePostProps) => {
    
    const queryClient = useQueryClient();// 게시물 등록 성공 후 목록 새로고침
    const {myUserId, myNickname, myProfileImageUrl} = useAuthStore();
    const currentQueryKey = ["feeds", size];

    // <응답타입, 에러타입, 입력데이터타입>
    return useMutation<postResponse, AxiosError<{message: string}>, PostFormValues>({
        meta:{disableGlobalError: true},//전역 에러 알림 막기
        mutationFn: async (data: PostFormValues) => {

            // 1. 엔터 압축 (엔터 3번 이상 -> 2번으로)
            const optimizedContent = data.content.trim().replace(/\n{3,}/g, '\n\n');

            // 2. 백엔드로 보낼 미디어 정보 조립
            const mediaUploadRequest = data.mediaList.map((item) => {
                return{
                    mediaUrl: item.originalKey || '',
                    mediaType: item.type,
                    originalFileName: item.originalFile.name,
                    cropState: item.cropState || null
                }
            });

            // 최종 백엔드 전송 데이터 조립
            const postRequest = {
                mediaList: mediaUploadRequest,
                content: optimizedContent,
                tagUserIds: data.tagUsers.map(user => user.userId)
            };

            // DB 저장 API 호출
            return await postApi.createPost(postRequest);
        },
        //[게시물 낙관적 업데이트]
        onMutate: async(newPostData) => {
            if (myUserId === null || myNickname === null || myProfileImageUrl === null){
                closeModal();
                return;
            }

            closeModal();
            await queryClient.cancelQueries({queryKey: currentQueryKey});
            
            // 피드 캐시 백업
            const previousPosts = queryClient.getQueryData(currentQueryKey);

            // 프론트엔드 캐시에 방금 쓴 게시물 가짜로 넣기
            queryClient.setQueryData<InfiniteData<{content: PostDto[]}>>(currentQueryKey, (oldData) => {
                if(!oldData || !oldData.pages) return oldData;

                const fakePost: PostDto = {
                    postId: Date.now(),
                    author: {
                        userId: myUserId,
                        nickname: myNickname,
                        profileImageUrl: myProfileImageUrl
                    },
                    content: newPostData.content,
                    media: newPostData.mediaList.map((m, idx) => ({
                        mediaUrl: m.originalKey || '',
                        type: m.type,
                        thumbnailUrl: null,
                        sortOrder: idx,
                        status: 'PROCESSING'
                    })),
                    commentCount: 0,
                    likeCount: 0,
                    isAuthor: true,
                    createdAt: new Date().toISOString()
                };

                const newPages = [...oldData.pages];

                if(newPages.length > 0){
                    newPages[0] = {
                        ...newPages[0],
                        content: [fakePost, ...newPages[0].content]
                    }
                }

                return {...oldData, pages: newPages};
            });

            return {previousPosts};
        },
        onSuccess: async () => {
            closeModal();
            toast.success('게시물이 등록되었습니다!');

            //최신 피드 목록을 백엔드에서 강제로 가져오기
            await queryClient.invalidateQueries({queryKey: currentQueryKey});
        },
        onError: (error) => {
            console.error("업로드 실패: ", error);
            toast.error('업로드 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    });
};