import { useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getVideoValidation } from '../util/videoValidation';
import type { SelectedMediaType } from '../types/SelectedMediaType';
import type { PostFormValues } from '../schemas/postSchema';
import type { CropUIState } from '../components/PostImageCropModal';

export const useMediaMutation = () => {
    // React Hook Form 연동
    const { setValue, watch } = useFormContext<PostFormValues>();
    const mediaList = watch('mediaList') || [];
    
    // UI 동작을 위한 상태 관리 (서버 전송 X)
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [choiceMediaNum, setChoiceMediaNum] = useState(0);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [isWebcamOpen, setIsWebcamOpen] = useState(false);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);

    const LIMIT = 5;
    const isMaxReached = mediaList.length >= LIMIT;

    // 1. 파일 추가 로직 (유효성 검사 포함)
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(e.target.files || []);
        if (!newFiles.length) return;

        const rejectedFiles: string[] = [];
        const validFiles: SelectedMediaType[] = [];
        const currentCount = mediaList.length;

        if (currentCount + newFiles.length > LIMIT) {
            toast.error(`최대 ${LIMIT}개까지만 등록 가능합니다.`);
        }

        const availableFiles = newFiles.slice(0, LIMIT - currentCount);

        for (const file of availableFiles) {
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');

            if (isImage && file.size > 10 * 1024 * 1024) {
                rejectedFiles.push(file.name);
                continue;
            }

            if (isVideo) {
                if (file.size > 100 * 1024 * 1024) {
                    rejectedFiles.push(file.name);
                    continue;
                }
                try {
                    const videoDuration = await getVideoValidation(file);
                    if (videoDuration > 60) {
                        rejectedFiles.push(file.name);
                        continue;
                    }
                } catch {
                    rejectedFiles.push(file.name);
                    continue;
                }
            }

            validFiles.push({
                file,
                previewUrl: URL.createObjectURL(file)
            });
        }

        if (rejectedFiles.length > 0) {
            toast.error(`${rejectedFiles.length}개 제외: 사진 10MB / 영상 100MB·60초 제한`, { duration: 5000 });
        }

        // meidaList에 데이터 저장
        setValue('mediaList', [...mediaList, ...validFiles], { shouldValidate: true });
        // 똑같은 파일 연속 업로드 가능하도록 
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // 2. 미디어 제거 로직
    const handleRemoveMedia = (indexToRemove: number) => {
        const newList = mediaList.filter((_, index) => index !== indexToRemove);
        URL.revokeObjectURL(mediaList[indexToRemove].previewUrl);
        
        setValue('mediaList', newList, { shouldValidate: true });

        if (choiceMediaNum === indexToRemove) {
            setChoiceMediaNum(0);
            setIsVideoPlaying(false);
        } else if (choiceMediaNum > indexToRemove) {
            setChoiceMediaNum(prev => prev - 1);
        }
    };

    // 3. 웹캠 캡처 완료 처리
    const handleWebcamCapture = (file: File) => {
        if (mediaList.length >= LIMIT) return;
        const newMedia = { file, previewUrl: URL.createObjectURL(file) };
        
        const newList = [...mediaList, newMedia];
        setValue('mediaList', newList, { shouldValidate: true });
        setChoiceMediaNum(newList.length - 1);
    };

    // 4. 크롭 완료 처리
    const handleCropComplete = (croppedFile: File, newCropState: CropUIState) => {
        const newList = [...mediaList];
        const targetMedia = newList[choiceMediaNum];

        if (targetMedia.croppedPreviewUrl) {
            URL.revokeObjectURL(targetMedia.croppedPreviewUrl);
        }

        newList[choiceMediaNum] = {
            ...targetMedia,
            croppedFile,
            croppedPreviewUrl: URL.createObjectURL(croppedFile),
            cropState: newCropState
        };

        setValue('mediaList', newList);
        setIsCropModalOpen(false);
    };

    return {
        mediaList,
        choiceMediaNum,
        setChoiceMediaNum,
        isVideoPlaying,
        setIsVideoPlaying,
        isWebcamOpen,
        setIsWebcamOpen,
        isCropModalOpen,
        setIsCropModalOpen,
        fileInputRef,
        isMaxReached,
        handleFileChange,
        handleRemoveMedia,
        handleWebcamCapture,
        handleCropComplete,
    };
};