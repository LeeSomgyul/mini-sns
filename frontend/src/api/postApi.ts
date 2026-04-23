import axios from "axios";
import api from './axios';

type backendFileType = 'IMAGE' | 'VIDEO' | 'THUMBNAIL';

export interface PresignedUrlRequest {
    filename: string;
    fileType: backendFileType;
}

export interface MediaUploadRequest{
    mediaUrl: string;
    thumbnailUrl: string;
    mediaType: backendFileType;
}

export interface createPostRequest{
    mediaList: MediaUploadRequest[];
    content: string;
    tagUserIds: number[];
}

const postApi = {

    //1.Presigned URL 발급 API와 연결 (Spring Boot 8080 통신)
    getPresignedUrl: async (request: PresignedUrlRequest) => {
        const response = await api.post('/api/v1/posts/presigned-url', request);
        return response.data.data;
    },

    //2.MiniO에 파일 직접 업로드 (MiniO 9000 통신)
    uploadToMinio: async (presignedUrl: string, file: File) => {
        await axios.put(presignedUrl, file, {
            headers: {
                'Content-Type': file.type,
            }
        });
    },

    //3.최종 게시물 등록 API와 연결 (Spring Boot 8080 통신)
    createPost: async (request: createPostRequest) => {
        const response = await api.post('/api/v1/posts', request);
        return response.data;
    }
};

export default postApi;