import { useMutation, useQueryClient } from "@tanstack/react-query";
 import toast from 'react-hot-toast';
import { postApi } from "../api/postApi";
import type { PostFormValues } from "../schemas/postSchema";
import type { postResponse} from "../types/postTypes";
import type { AxiosError } from "axios";


interface UseCreatePostProps {
    closeModal: () => void;
}

// [백엔드로 데이터 최종 전송]
// 리엑트 훅 폼에 모인 uppy가 등록한 파일 정보 + 크롭 데이터를 백엔드로 전달
export const useCreatePostMutation = ({ closeModal }: UseCreatePostProps) => {
    
    // 게시물 등록 성공 후 목록 새로고침
    const queryClient = useQueryClient();

    // <응답타입, 에러타입, 입력데이터타입>
    return useMutation<postResponse, AxiosError<{message: string}>, PostFormValues>({
        mutationFn: async (data: PostFormValues) => {

            // 1. 엔터 압축 (엔터 3번 이상 -> 2번으로)
            const optimizedContent = data.content.trim().replace(/\n{3,}/g, '\n\n');

            // 2. 백엔드로 보낼 미디어 정보 조립
            const mediaUploadRequest = data.mediaList.map((item) => {
                return{
                    mediaUrl: item.originalKey || '',
                    mediaType: item.type,
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
        onSuccess: () => {
            toast.success('게시물이 등록되었습니다!');
            queryClient.invalidateQueries({queryKey: ['posts']});
            closeModal();
        },
        onError: (error) => {
            console.error("업로드 실패: ", error);
            toast.error('업로드 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    });
};