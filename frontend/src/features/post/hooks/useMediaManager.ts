import { useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getVideoValidation } from '../util/videoValidation';
import type { SelectedMediaType } from '../types/SelectedMediaType';
import type { PostFormValues } from '../schemas/postSchema';
import type { CropUIState } from '../components/PostImageCropModal';

//handleFileChange 메서드의 미디어 검사 결과 타입
type ValidationResult = {
    success: boolean;
    data?: SelectedMediaType;//success 경우에만 담는 데이터
    errorFileName?: string;
}

export const useMediaManager = () => {
    const { setValue, watch, getValues } = useFormContext<PostFormValues>();
    
    //과거 미디어 목록 
    const mediaList = watch('mediaList') || [];
    
    // UI 동작을 위한 상태 관리 (서버 전송 X)
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [choiceMediaNum, setChoiceMediaNum] = useState(0);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [isWebcamOpen, setIsWebcamOpen] = useState(false);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);

    const LIMIT = 5;
    const isMaxReached = mediaList.length >= LIMIT;

    // [미디어 추가(변경) 시 실행]
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        
        //파일 객체를 배열 형식으로 변환
        const newFiles = Array.from(e.target.files || []);

        //파일 등록 안했다면 return
        if (!newFiles.length) return;

        // postSchema.ts의 mediaList: 사용자가 등록한 최신 미디어 목록 검사
        const currentMediaList = (getValues('mediaList') || []) as SelectedMediaType[];
        const currentCount = currentMediaList.length;

        if (currentCount + newFiles.length > LIMIT) {
            toast.error(`최대 ${LIMIT}개까지만 등록 가능합니다.`);
        }

        // 사용자가 5개상 올렸다면 5개까지 자른 다음 newFiles 배열에 저장
        const availableFiles = newFiles.slice(0, LIMIT - currentCount);

        // 미디어 동시 검사
        const validationPromises = availableFiles.map(async(file): Promise<ValidationResult> => {
            
            // 이미지, 미디어 분별
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');

            // 용량 제한: 사진은 10MB 까지만 가능
            if (isImage && file.size > 10 * 1024 * 1024) return {success: false, errorFileName: file.name};

            // 용량 제한: 영상은 100MB 까지만 가능
            if (isVideo) {
                if (file.size > 100 * 1024 * 1024) return {success: false, errorFileName: file.name};
                try {
                    //시간 제한: 영상은 60초 까지만 가능
                    const videoDuration = await getVideoValidation(file);
                    if (videoDuration > 60) return {success: false, errorFileName: file.name};
                } catch {
                    return{success: false, errorFileName: file.name}
                }
            }

            // 모두 통과한 미디어: 브라우저에서 볼 수 있는 URL 주소 형식 발급 
            return{
                success: true,
                data: {file, previewUrl: URL.createObjectURL(file)}
            }
        });

        //결과
        const result = await Promise.all(validationPromises);

        //검사 통과 & 미통과
        const validFiles = result
            .filter(res => res.success === true)
            .map(res => res.data as SelectedMediaType);
        const rejectedFiles = result
            .filter(res => res.success === false)
            .map(res => res.errorFileName as string);

        //추가 실패한 파일에 대한 종합 알림
        if (rejectedFiles.length > 0) {
            toast.error(`${rejectedFiles.length}개 제외: 사진 10MB / 영상 100MB·60초 제한`, { duration: 5000 });
        }

        // meidaList에 데이터 저장
        if(validFiles.length > 0){
            setValue('mediaList', [...currentMediaList, ...validFiles], { shouldValidate: true });
        }
        
        // 똑같은 파일 연속 업로드 가능하도록 
        if (fileInputRef.current) fileInputRef.current.value = '';
            
    }


    // [미디어 제거]
    const handleRemoveMedia = (indexToRemove: number) => {
        const newList = mediaList.filter((_, index) => index !== indexToRemove);

        // 미디어 추가할때 생성한 미리보기 URL 제거
        URL.revokeObjectURL(mediaList[indexToRemove].previewUrl);
        
        setValue('mediaList', newList, { shouldValidate: true });

        if (choiceMediaNum === indexToRemove) {
            setChoiceMediaNum(0);
            setIsVideoPlaying(false);
        } else if (choiceMediaNum > indexToRemove) {
            setChoiceMediaNum(prev => prev - 1);
        }
    };

    // [웹캠]
    const handleWebcamCapture = (file: File) => {
        if (mediaList.length >= LIMIT) return;
        const newMedia = { file, previewUrl: URL.createObjectURL(file) };
        
        const newList = [...mediaList, newMedia];
        setValue('mediaList', newList, { shouldValidate: true });
        setChoiceMediaNum(newList.length - 1);
    };

    // [크롭]
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