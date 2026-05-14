import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import toast from 'react-hot-toast';
import {Uppy} from '@uppy/core';
import AwsS3 from '@uppy/aws-s3';

import { getVideoValidation } from '../util/videoValidation';
import type { SelectedMediaType } from '../types/SelectedMediaType';
import type { PostFormValues } from '../schemas/postSchema';
import type { CropUIState } from '../components/PostImageCropModal';
import { postApi } from '../api/postApi';
import type{
    CreateMultipartRequest,SingPartRequest,ListPartsRequest,CompleteMultipartRequest,
    AbortMultipartRequest, backendFileType
} from "../types/postTypes";

//[미디어가 업로드되는 순간 실행]
//역할: 미디어 파일 받기, uppy로 넘기기, 서버와 통신
export const useMediaManager = () => {
    //사용자의 form 등록과 관련된 메서드
    const { setValue, watch, getValues } = useFormContext<PostFormValues>();

    //현재 등록된 미디어 목록
    const mediaList = watch('mediaList') || [];

    //현재 등록된 미디어 개수
    const isMaxReached = mediaList.length >= 5;
    
    //[UPPY]
    const [uppy] = useState(() => {

        // 1. [Uppy 객체 생성]
        const u = new Uppy({
            // 해당 업로더의 고유 이름
            id: 'media-uploader',
            // 사용자가 미디어 업로드 하자마자 바로 전송 시작
            autoProceed: true,
            // 업로드할 파일에 대한 규칙 정의
            restrictions: {
                maxNumberOfFiles: 5,//한번에 5개까지 업로드 가능
                allowedFileTypes: ['image/*', 'video/*']//이미지, 비디오만 가능
            },
        });

        //2. [Multipart 플러그인 적용]
        u.use(AwsS3, {
            shouldUseMultipart: true, //조각 업로드 사용
            limit: 3, //동시 업로드 3개 제한
            
            //1.업로드 시작: 백엔드에서 objectKey와 uploadId를 받아옴
            createMultipartUpload: async (file) => {

                const type: backendFileType = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';

                const request: CreateMultipartRequest = {
                    filename: file.name,
                    fileType: type,
                    contentType: file.type ||'application/octet-stream'
                };

                const response = await postApi.createMultipartUpload(request);

                //Uppy 메타 데이터에 ObjectKey 저장 (나중에 '저장'버튼 누를 때 DB 저장 시 사용)
                u.setFileMeta(file.id, {originalObjectKey: response.objectKey});

                return {
                    uploadId: response.uploadId,
                    key: response.objectKey,
                };
            },

            //2.서명: 조각(partNumber)별 Presigned URL 발급
            signPart: async (_file, partData) => {

                const request: SingPartRequest = {
                    uploadId: partData.uploadId,
                    objectKey: partData.key,
                    partNumber: partData.partNumber
                };

                const response = await postApi.signPart(request);

                return {url: response.presignedUrl};
            },

            //3.확인: minio에 조각들이 잘 도착했나 확인 (전송은 2번과 3번 사이에서 프론트에서 함)
            listParts: async (_file, {uploadId, key}) => {

                if(!uploadId || !key){
                    throw new Error("업로드 결합을 위한 필수 정보가 누락되었습니다.");
                }

                const request: ListPartsRequest = {
                    uploadId: uploadId,
                    objectKey: key
                };

                const response = await postApi.listParts(request);

                return response.parts;
            },

            //4.조립: 조각들 합치기
            completeMultipartUpload: async (_file, {uploadId, key, parts}) => {

                const request: CompleteMultipartRequest = {
                    uploadId: uploadId,
                    objectKey: key,
                    parts: parts.map(part => ({
                        PartNumber: part.PartNumber as number,
                        ETag: part.ETag as string
                    }))
                };

                const response = await postApi.completeMultipartUpload(request);

                return {location: response.location};
            },

            //5.업로드 취소
            abortMultipartUpload: async (_file, {uploadId, key}) => {

                if(!uploadId || !key){
                    throw new Error("업로드 결합을 위한 필수 정보가 누락되었습니다.");
                }
                
                const request: AbortMultipartRequest = {
                    uploadId: uploadId,
                    objectKey: key
                };

                const response = await postApi.abortMultipartUpload(request);

                return response;
            }
        });

        //3. [새로운 파일 리스트 업데이트] 화면에 미리보기 즉시 띄우기
        u.on('file-added', (file) => {

            const currentList = getValues('mediaList')||[];

            //업로드한 파일이 영상인지 확인
            const isVideo = file.type.startsWith('video/');

            //원본 파일
            const originalFile = file.data as File;

            //'업로드중' 상태 저장
            const newItem: SelectedMediaType = {
                id: file.id,
                type: isVideo ? 'VIDEO' : 'IMAGE',
                status: 'UPLOADING',
                previewUrl: URL.createObjectURL(originalFile),
                originalFile: originalFile,
                cropState: {zoom: 1, rotation: 0, crop: {x: 0, y: 0}},
            };

            //기존 파일 + 새 업로드 파일
            setValue('mediaList', [...currentList, newItem], {shouldValidate: true});
        });

        // 4. [업로드 성공 이벤트]: objectKey를 React Hook Form에 저장 (브라우저 -> 백엔드 서버)
        u.on('upload-success', (file) => {
            //파일이 없으면 종료
            if(!file) return;

            //objectKey 가져오기
            const {originalObjectKey} = file.meta;

            //현재 추가한 미디어 리스트들
            const currentList = getValues('mediaList') || [];

            //업로드 완료한 미디어의 id를 찾아 성공 상태로 바꾸기
            const updatedList: SelectedMediaType[] = currentList.map(item => {
                if(item.id === file.id){
                    return{
                        ...item,
                        status: 'SUCCESS',
                        originalKey: originalObjectKey as string
                    }
                }
                return item;
            });

            //기존 파일 + 새 업로드 파일
            setValue('mediaList', updatedList, {shouldValidate: true});
        });

        // 5. [업로드 실패 이벤트]
        u.on('upload-error', (file) => {
            const currentList = getValues('mediaList') || [];
            const updatedList: SelectedMediaType[] = currentList.map(item => {
                if(item.id === file?.id){
                    return{
                    ...item,
                    status: 'ERROR'
                    }
                }
                return item;
            })

            setValue('mediaList', updatedList, {shouldValidate: true});
        });

        return u;
    });


    // [미디어 추가(변경) 시 실행]
    const handleAddMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
        
        //사용자가 지금 form에 등록중인 새 파일들
        const newFiles = Array.from(e.target.files || []);
        if (!newFiles.length) return;

        //현재 등록되어있는 파일 개수 체크
        const currentCount = getValues('mediaList')?.length || 0;

        //현재 이미 등록되어있는 파일 개수 + 추가한 파일 > 5개 라면 막기
        if(currentCount + newFiles.length > 5){
            toast.error('파일은 최대 5개까지만 등록 가능합니다.');
            if(e.target) e.target.value = '';
            return;
        }

        //파일 하나씩 용량 & 영상 길이 검사
        for(const file of newFiles){
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');

            if (isImage && file.size > 10 * 1024 * 1024) {
                toast.error(`'${file.name}'이미지의 크기가 10MB를 초과합니다.`);
                continue;
            };

            if(isVideo && file.size > 100 * 1024 * 1024){
                toast.error(`'${file.name}'영상의 크기가 100MB를 초과합니다.`);
                continue;
            }

            if(isVideo){
                try {
                    const videoDuration = await getVideoValidation(file);
                    if (videoDuration > 60){
                        toast.error(`'${file.name}'영상의 길이가 60초를 초과합니다.`);
                        continue;
                    };
                } catch {
                    toast.error(`'${file.name}' 영상을 분석할 수 없습니다.`);
                    continue;
                }
            }

            //[uppy의 u.on('file-added') 실행]
            try{
                uppy.addFile({
                    name: file.name,
                    type: file.type,
                    data: file,
                });
            }catch(error: unknown){
                if(error instanceof Error){
                    if(error.message.includes('already exists')){
                        toast.error('이미 추가된 파일입니다.');
                        continue;
                    }else if(error.message.includes('exceeds maximum')){
                        toast.error('최대 5개까지만 등록 가능합니다.');
                        break;
                    }
                }else{
                    toast.error('파일을 추가하는 중 알 수 없는 오류가 발생했습니다.');
                    continue;
                }
                break;
            }
        }

        if(e.target) e.target.value = '';
    };


    // [미디어 제거]
    const handleRemoveMedia = (indexToRemove: number) => {
        //현재 등록되어있는 미디어에서 몇 번째 인덱스인지 확인
        const currentList = getValues('mediaList') || [];
        const itemToRemove = currentList[indexToRemove];

        if(!itemToRemove) return;

        //uppy 내부 큐 업로드 취소
        try{
            uppy.removeFile(itemToRemove.id);
        }catch(error){
            console.warn('uppy 파일 제거 무시됨: ', error);
        }

        //브라우저 메모리 누수 방지
        if(itemToRemove.previewUrl){
            URL.revokeObjectURL(itemToRemove.previewUrl);
        }

        //최종 미디어 리스트 업데이트
        const newList = mediaList.filter((_, index) => index !== indexToRemove);
        
        setValue('mediaList', newList, { shouldValidate: true });
    };

    // [웹캠]
    const handleWebcamCapture = (file: File) => {
        const currentCount = getValues('mediaList') || [];

        if(currentCount.length >= 5){
            toast.error('파일은 최대 5개까지만 등록 가능합니다.');
            return;
        }

        try{
            uppy.addFile({
                name: file.name || `webcam-${Date.now()}.jpg`,
                type: file.type || 'image/jpeg',
                data: file,
            });

            return true;
        }catch{
            toast.error('이미지를 추가하는 데 실패했습니다.');
            return false;
        }
    };

    // [크롭]
    const handleCropComplete = (targetIndex: number, newCropState: CropUIState, newCroppedUrl: string) => {
        const currentList = getValues('mediaList') || [];
        const targetMedia = currentList[targetIndex];

        if(!targetMedia) return;

        const newList = [...currentList];

        newList[targetIndex] = {
            ...targetMedia,
            cropState: newCropState,
            croppedPreviewUrl: newCroppedUrl
        };

        setValue('mediaList', newList, {shouldValidate: true});
    };

    return {
        uppy,
        mediaList,
        isMaxReached,
        actions: {
            addMedia: handleAddMedia,
            removeMedia: handleRemoveMedia,
            captureWebcam: handleWebcamCapture,
            completeCrop: handleCropComplete,
        }
    };
};