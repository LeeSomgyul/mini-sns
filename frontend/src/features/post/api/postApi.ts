import axios from "axios";
import api from '../../../common/api/axios';
import type { ApiResponse } from "../../../common/types/commonType";
import type{ PresignedUrlRequest, PresignedUrlResponse, postRequest, postResponse } from "../types/postTypes";


export const postApi = {

    //1.Presigned URL 발급 API와 연결 메서드 (Spring Boot 8080 통신)
    getPresignedUrl: async (request: PresignedUrlRequest) => {
        const response = await api.post<ApiResponse<PresignedUrlResponse>>(
            '/api/v1/posts/presigned-url',
            request
        );
        return response.data.data;
    },

    //2.MiniO에 파일 직접 업로드 메서드 (MiniO 9000 통신)
    uploadToMinio: async (presignedUrl: string, file: File) => {
        await axios.put(presignedUrl, file, {
            headers: {
                'Content-Type': file.type,
            }
        });
    },

    //3.최종 게시물 등록 API와 연결 메서드 (Spring Boot 8080 통신)
    createPost: async (request: postRequest) => {
        const response = await api.post<ApiResponse<postResponse>>(
            '/api/v1/posts',
            request
        );
        return response.data.data;
    }
};
