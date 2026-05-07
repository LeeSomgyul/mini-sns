import { useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import toast from 'react-hot-toast';
import {Uppy, type UppyFile} from '@uppy/core';
import AwsS3 from '@uppy/aws-s3';

import { getVideoValidation } from '../util/videoValidation';
import type { SelectedMediaType } from '../types/SelectedMediaType';
import type { PostFormValues } from '../schemas/postSchema';
import type { CropUIState } from '../components/PostImageCropModal';
import { postApi } from '../api/postApi';
import {extractVideoThumbnail, extractImageThumbnail} from '../util/extractThumbnail';

interface MyFileMeta{
    [key: string]: any;//아래 3가지 외에도 다른 키 들어올 수 있다는 의미
    originalObjectKey?: string;
    thumbnailObjectKey?: string;
    uploadType?: 'IMAGE' | 'VIDEO' | 'THUMBNAIL';
}

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
    const uppy = useMemo(() => {

        // 1. Uppy 객체 생성
        const u = new Uppy({
            // 해당 업로더의 고유 이름
            id: 'media-uploader',
            // 업로드할 파일에 대한 규칙 정의
            restrictions: {
                maxNumberOfFiles: 5,//한번에 5개까지 업로드 가능
                allowedFileTypes: ['image/*', 'video/*']//이미지, 비디오만 가능
            },
        });

        //2. 원본 미디어(이미지, 영상) Presigned URL를 minio에 업로드
        u.use(AwsS3, {
            //파일 쪼개서 업로드x (5GB 넘는 대용량 파일 업로드 시에만 ture)
            shouldUseMultipart: false,
            //동시 업로드 3개 제한
            limit: 3,
            getUploadParameters: async (file) => {
                //미디어 타입 판별
                const type = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';

                //Presigned URL 발급
                const {presignedUrl, objectKey} = await postApi.getPresignedUrl({
                    filename: file.name,
                    fileType: type
                });

                //objectKey(DB 저장용 경로)를 메타 데이터(메모리)에 저장
                u.setFileMeta(file.id, {originalObjectKey: objectKey});

                //minio 업로드
                return{
                    method: 'PUT',
                    url: presignedUrl,
                    headers: {'Content-Type': file.type},
                };
            }, 
        });

        //3. 새로운 파일 리스트 업데이트 & 썸네일 생성 및 minio에 업로드
        u.on('file-added', async(file) => {
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

            //기존 업로드 되어있는 미디어 파일들 가져오기
            const currentList = getValues('mediaList')||[];

            //기존 파일 + 새 업로드 파일
            setValue('mediaList', [...currentList, newItem], {shouldValidate: true});

            //썸네일 추출 및 minio 업로드
            try{
                //영상 & 이미지 썸네일 추출
                const thumbnailFile = isVideo
                    ? await extractVideoThumbnail(originalFile)
                    : await extractImageThumbnail(originalFile);

                //Presigned URL 발급
                const {presignedUrl, objectKey} = await postApi.getPresignedUrl({
                    filename: file.name,
                    fileType: 'THUMBNAIL'
                });

                //minio 업로드
                await postApi.uploadToMinio(presignedUrl, thumbnailFile);

                //objectKey(DB 저장용 경로)를 메타 데이터(메모리)에 저장
                u.setFileMeta(file.id, {thumbnailObjectKey: objectKey});
            }catch(error){
                console.error('썸네일 생성 실패: ', error);
                toast.error('썸네일 생성에 실패했습니다.');
            }
        });
        return u;
    },[]);

    //업로드 완료 시 objectKey를 React Hook Form에 저장 (브라우저 -> 백엔드 서버)
    useEffect(() => {
        //[업로드 성공 이벤트]
        const handleUploadSuccess = (file?: UppyFile<MyFileMeta, any>) => {

            //파일이 없으면 종료
            if(!file) return;

            //objectKey 가져오기
            const {originalObjectKey, thumbnailObjectKey} = file.meta;

            //현재 추가한 미디어 리스트들
            const currentList = getValues('mediaList') || [];

            //업로드 완료한 미디어의 id를 찾아 성공 상태로 바꾸기
            const updatedList: SelectedMediaType[] = currentList.map(item => {
                if(item.id === file.id){
                    return{
                        ...item,
                        status: 'SUCCESS',
                        originalKey: originalObjectKey,
                        thumbnailKey: thumbnailObjectKey
                    }
                }
                return item;
            });

            setValue('mediaList', updatedList, {shouldValidate: true});
        };

        //[업로드 실패 이벤트]
        const handleUploadError = (file: UppyFile<MyFileMeta,any> | undefined, error: any) => {
            
            console.log('업로드 에러: ', error);

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
        };

        return () => {
            uppy.off('upload-success', handleUploadSuccess);
            uppy.off('upload-error', handleUploadError);
        }
    }, [uppy, getValues, setValue]);


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
                toast.error('파일은 최대 5개까지만 등록 가능합니다.');
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
        }catch(error){
            toast.error('이미지를 추가하는 데 실패했습니다.');
            return false;
        }
    };

    // [크롭]
    const handleCropComplete = (targetIndex: number, newCropState: CropUIState) => {
        const currentList = getValues('mediaList') || [];
        const targetMedia = currentList[targetIndex];

        if(!targetMedia) return;

        const newList = [...currentList];

        newList[targetIndex] = {
            ...targetMedia,
            cropState: newCropState
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