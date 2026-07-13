import api from '../../../common/api/axios';
import type { ApiResponse } from '../../../common/types/commonType';
import type { 
    ProfileCreateMultipartRequest, ProfileCreateMultipartResponse,
    ProfileSingPartRequest, ProfileSingPartResponse,
    ProfileMultipartListPartsRequest, ProfileMultipartListPartsResponse,
    ProfileCompleteRequest, ProfileCompleteResponse,
    AbortProfileMultipartRequest
 } from "../types/UserProfileMultipartType";

export const profileMutipartApi = {
    // [1단계] 프로필 이미지 분할 업로드 시작
    profileCreateUpload: async(request: ProfileCreateMultipartRequest): Promise<ProfileCreateMultipartResponse> => {
        const response = await api.post<ApiResponse<ProfileCreateMultipartResponse>>(
            '/api/v1/users/profile/multipart/create',
            request
        );

        return response.data.data;
    },

    // [2단계] 이미지 조각 파일 별 Presigned URL 발급 (서명)
    profileSignPart: async(request: ProfileSingPartRequest): Promise<ProfileSingPartResponse> => {
        const response = await api.post<ApiResponse<ProfileSingPartResponse>>(
            '/api/v1/users/profile/multipart/sign-part',
            request
        );

        return response.data.data;
    },

    // [3단계] 프론트엔드가 MiniO에 Presigned URL로 파일을 잘 저장했는지 리스트 꺼내서 확인
    listProfileParts: async(request: ProfileMultipartListPartsRequest): Promise<ProfileMultipartListPartsResponse> => {
        const { uploadId, objectKey } = request;
        const encodedKey = encodeURIComponent(objectKey);

        const response = await api.get<ApiResponse<ProfileMultipartListPartsResponse>>(
            `/api/v1/users/profile/multipart/list-parts?uploadId=${uploadId}&objectKey=${encodedKey}`
        );

        return response.data.data;
    },

    // [4단계] MiniO에서 분할된 조각들 가져와서 순서대로 합치기
    completeProfileUpload: async(request: ProfileCompleteRequest): Promise<ProfileCompleteResponse> => {
        const response = await api.post<ApiResponse<ProfileCompleteResponse>>(
            '/api/v1/users/profile/multipart/complete',
            request
        );

        return response.data.data;
    },

    // [5단계] 프로필 이미지 분할 업로드 시 사용자가 중간에 취소한 경우, MiniO 서버에 저장된 파편들 제거
    abortProfileUpload: async(request: AbortProfileMultipartRequest): Promise<void> => {
        const { uploadId, objectKey} = request;
        const encodedKey = encodeURIComponent(objectKey);

        await api.delete(
            `/api/v1/users/profile/multipart/abort?uploadId=${uploadId}&objectKey=${encodedKey}`
        );
    }

}