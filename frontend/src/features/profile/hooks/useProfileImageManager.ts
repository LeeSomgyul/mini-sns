import { useState } from "react";
import Uppy from "@uppy/core";
import AwsS3 from '@uppy/aws-s3';
import { profileMutipartApi } from "../api/profileMutipartApi";
import type { SelectedProfileImageType } from "../types/SelectedProfileImageType";
import toast from "react-hot-toast";


interface ProfileImageManagerProps {
    setUploadState: React.Dispatch<React.SetStateAction<SelectedProfileImageType | null>>;
}

// [개인정보 변경에서 프로필 이미지를 등록하는 순간 실행]
export const useProfileImageManager = ({setUploadState}: ProfileImageManagerProps) => {
    
    const [uppy] = useState(() => {
        
        // 1. uppy 초기화
        const u = new Uppy({
            id: 'profile-image-uploader',
            autoProceed: true, // 이미지 선택 즉시 분할 업로드 시작
            restrictions: {
                maxFileSize: 10 * 1024 * 1024, // 10MB 제한
                maxNumberOfFiles: 1,           // 1장만 업로드 가능
                allowedFileTypes: ['image/*'], // 이미지만 허용
            },
        });

        u.use(AwsS3, {
            shouldUseMultipart: true,
            limit: 2,

            // [1단계] 프로필 이미지 분할 업로드 시작 (백엔드에서 uploadId와 objectKey 발급받기)
            createMultipartUpload: async(file) => {
                const response = await profileMutipartApi.profileCreateUpload({
                    filename: file.name,
                    contentType: file.type || 'application/octet-stream',
                    fileSize: file.size || 0,
                });

                // uppy 메타데이터 공간에 objectKey를 임시 저장
                u.setFileMeta(file.id, {serverObjectKey: response.objectKey });

                return{
                    uploadId: response.uploadId,
                    key: response.objectKey,
                };
            },

            // [2단계] 이미지 조각 파일 별 Presigned URL 발급 (서명)
            signPart: async(_file, partData) => {
                const response = await profileMutipartApi.profileSignPart({
                    uploadId: partData.uploadId,
                    objectKey: partData.key,
                    partNumber: partData.partNumber,
                });

                return{ url: response.presignedUrl};
            },

            // [3단계] 프론트엔드가 MiniO에 Presigned URL로 파일을 잘 저장했는지 리스트 꺼내서 확인
            listParts: async (_file, { uploadId, key }) => {
                if (!uploadId || !key) {
                    throw new Error("업로드 검증을 위한 정보가 부족합니다.");
                }
                const response = await profileMutipartApi.listProfileParts({ uploadId, objectKey: key });
                return response.parts.map(part => ({
                    PartNumber: part.partNumber,
                    ETag: part.eTag,
                    Size: part.size, 
                }));
            },

            // [4단계] MiniO에서 분할된 조각들 가져와서 순서대로 합치기
            completeMultipartUpload: async (_file, { uploadId, key, parts }) => {
                const response = await profileMutipartApi.completeProfileUpload({
                    uploadId: uploadId,
                    objectKey: key,
                    parts: parts.map(part => ({
                        PartNumber: part.PartNumber as number,
                        ETag: part.ETag as string,
                    })),
                });
                return { location: response.location };
            },

            // [5단계] 프로필 이미지 분할 업로드 시 사용자가 중간에 취소한 경우, MiniO 서버에 저장된 파편들 제거
            abortMultipartUpload: async (_file, { uploadId, key }) => {
                if (!uploadId || !key) return;
                await profileMutipartApi.abortProfileUpload({ uploadId, objectKey: key });
            },
        });

        // 2. uppy 파일 감지 이벤트
        u.on('file-added', (file) => {
            const originalFile = file.data as File;

            setUploadState({
                id: file.id,
                status: 'UPLOADING',
                previewUrl: URL.createObjectURL(originalFile),
                originalFile: originalFile,
            });
        });

        // 3. 업로드 최종 성공 이벤트
        u.on('upload-success', (file) => {
            if (!file) return;

            const { serverObjectKey } = file.meta;

           setUploadState((prev) => {
                if (!prev) return null; 
                
                return {
                    ...prev,
                    status: 'SUCCESS',
                    originalKey: serverObjectKey as string,
                };
            });
        });

        // 4. 업로드 실패 이벤트
        u.on('upload-error', () => {
            setUploadState((prev) => {
                if(!prev) return null;

                return{
                    ...prev, status: 'ERROR' 
                };
            });
        });

        // 5. 예외 메시지
        u.on('restriction-failed', () => {
            toast.error("프로필에는 이미지 파일만 등록할 수 있습니다!");
            setUploadState(prev => prev ? { ...prev, status: 'ERROR' } : null);
        });

        return u;
    });

    return {uppy};
};