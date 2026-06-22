import api from '../../../common/api/axios';
import type { ApiResponse } from "../../../common/types/commonType";
import type{
    CreateMultipartRequest, CreateMultipartResponse,
    SingPartRequest, SingPartResponse,
    postRequest, postResponse,
    ListPartsRequest, ListPartsResponse,
    CompleteMultipartRequest, CompleteMultipartResponse,
    AbortMultipartRequest
} from "../types/postTypes";


export const postApi = {

    //1.업로드 시작: 백엔드에서 objectKey와 uploadId를 받아옴
    createMultipartUpload: async (request: CreateMultipartRequest) => {
        const response = await api.post<ApiResponse<CreateMultipartResponse>>(
            '/api/v1/media/multipart/create',
            request
        );
        return response.data.data;
    },

    //2.조각(partNumber)별 Presigned URL 발급
    signPart: async (request: SingPartRequest) => {
        const response = await api.post<ApiResponse<SingPartResponse>>(
            '/api/v1/media/multipart/sign-part',
            request
        );
        return response.data.data;
    },

    //3.어디까지 올렸는지 조회
    listParts: async (request: ListPartsRequest) => {
        const response = await api.get<ApiResponse<ListPartsResponse>>(
            `/api/v1/media/multipart/list-parts`,
            { params: request }
        );
        return response.data.data;
    },

    //4.MiniO에 최종 저장 및 조각들 순서대로 조립 완료
    completeMultipartUpload: async (request: CompleteMultipartRequest) => {
        const response = await api.post<ApiResponse<CompleteMultipartResponse>>(
            '/api/v1/media/multipart/complete',
            request
        );
        return response.data.data;
    },

    //5.업로드 취소
    abortMultipartUpload: async (request: AbortMultipartRequest) => {
        const response = await api.delete<ApiResponse<void>>(
            '/api/v1/media/multipart/abort',
            {params: request}
        );
        return response.data.data;
    },

    //6. 최종 게시물 등록
    createPost: async (request: postRequest) => {
        const response = await api.post<ApiResponse<postResponse>>(
            '/api/v1/posts',
            request
        );
        return response.data.data;
    },

    //7. 게시물 삭제
    deletePost: async(postId: number) => {
        const response = await api.delete<ApiResponse<void>>(
            `/api/v1/posts/${postId}`
        );
        return response.data.data;
    }
};
