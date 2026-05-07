import { useState, useRef } from 'react';
import toast from 'react-hot-toast';

//[미디어 등록 UI 상태]
export const useMediaUI = (initialIndex = 0) => {
    //미디어 등록의 숨겨진 input에 접근
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // UI 동작을 위한 상태 관리 (서버 전송 X)
    const [choiceMediaNum, setChoiceMediaNum] = useState(initialIndex);//미리보기에 출력되고있는 미디어의 인덱스 번호
    const [isWebcamOpen, setIsWebcamOpen] = useState(false);//웹캠 모달 오픈 유무
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);//크롭 모달 오픈 유무

    //[웹캠 모달 핸들러]: 웹캠 모달 열었을때 실행 
    const handleOpenWebcam = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            toast.error('이 브라우저 환경에서는 카메라를 지원하지 않습니다.');
            return;
        }
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasCamera = devices.some(device => device.kind === 'videoinput');
            if (!hasCamera) return toast.error('카메라 장치를 찾을 수 없습니다.');
            
            setIsWebcamOpen(true);
        } catch {
            toast.error('카메라 상태를 확인할 수 없습니다.');
        }
    };

    return{
        fileInputRef,
        uiState: {
            choiceMediaNum,
            isWebcamOpen,
            isCropModalOpen
        },
        uiActions: {
            setChoiceMediaNum,
            openWebcamModal: handleOpenWebcam,
            closeWebcamModal: () => setIsWebcamOpen(false),
            openCropModal: () => setIsCropModalOpen(true),
            closeCropModal: () => setIsCropModalOpen(false),
        }
    };
};