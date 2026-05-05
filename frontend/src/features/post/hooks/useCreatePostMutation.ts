import { useMutation, useQueryClient } from "@tanstack/react-query";
 import toast from 'react-hot-toast';
import { postApi } from "../api/postApi";
import type { PostFormValues } from "../schemas/postSchema";
import type { postResponse, MediaUploadRequest } from "../types/postTypes";
import type { AxiosError } from "axios";


interface UseCreatePostProps {
    closeModal: () => void;
}

export const useCreatePostMutation = ({ closeModal }: UseCreatePostProps) => {
    // 게시물 등록 성공 후 목록 새로고침
    const queryClient = useQueryClient();

    // 파일 확장자를 대문자로 변경 (DB에 대문자로 저장되어야 함)
    const getFileTypeEnum = (mediaType: string) => {
        if (mediaType.startsWith('video/')) return 'VIDEO';
        return 'IMAGE';
    };

    // minio 업로드 로직
    // PresignedUrl 발급 -> 업로드
    const uploadWithPresignedUrl = async (file: File, type: 'IMAGE' | 'VIDEO' | 'THUMBNAIL') => {
        const { presignedUrl, objectKey } = await postApi.getPresignedUrl({
            filename: file.name,
            fileType: type
        });
        await postApi.uploadToMinio(presignedUrl, file);
        return objectKey;
    };

    // <응답타입, 에러타입, 입력데이터타입>
    return useMutation<postResponse, AxiosError<{message: string}>, PostFormValues>({
        mutationFn: async (data: PostFormValues) => {
            const uploadedMediaInfo: MediaUploadRequest[] = [];

            // 엔터 압축 (엔터 3번 이상 -> 2번으로)
            const optimizedContent = data.content.trim().replace(/\n{3,}/g, '\n\n');

            // 미디어 파일들을 하나씩 MiniO에 업로드
            for (const item of data.mediaList) {
                const { file } = item;
                const backendFileType = getFileTypeEnum(file.type);
                
                // 썸네일 추출 (임시 주석 처리 - 실제 함수에 맞게 수정)
                // const thumbnailFile = await (backendFileType === 'VIDEO'
                //     ? extractVideoThumbnail(file)
                //     : extractImageThumbnail(file));
                const thumbnailFile = file; // 🚨 임시: 에러 방지용. 실제 썸네일 추출 로직으로 대체하세요.

                // 원본, 썸네일 동시 업로드
                const [mediaUrl, thumbnailUrl] = await Promise.all([
                    uploadWithPresignedUrl(file, backendFileType),
                    uploadWithPresignedUrl(thumbnailFile, 'THUMBNAIL')
                ]);

                uploadedMediaInfo.push({
                    mediaUrl,
                    thumbnailUrl,
                    mediaType: backendFileType
                });
            }

            // 최종 백엔드 전송 데이터 조립
            const postRequest = {
                mediaList: uploadedMediaInfo,
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