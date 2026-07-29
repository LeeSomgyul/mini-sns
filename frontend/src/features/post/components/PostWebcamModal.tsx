import { useEffect, useRef, useState } from "react";
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';

interface PostWebcamModalProps{
    closeModal: () => void;
    captureResult: (file: File) => void;
}

export default function PostWebcamModal({closeModal, captureResult}: PostWebcamModalProps){
    const videoRef = useRef<HTMLVideoElement>(null);//<video/>
    const [stream, setStream] = useState<MediaStream|null>(null);//카메라 실행 여부
    const [capturedImage, setCapturedImage] = useState<string|null>(null);//캡쳐 결과 이미지(화면 확인용)
    const [capturedFile, setCapturedFile] = useState<File|null>(null);//캡쳐 결과 파일(저장용)

    //[초기 웹캠 진입 시] 카메라 권한 요청 및 비디오 스트림 연결
    useEffect(() => {
        let isMounted = true;//2번 실행 방지
        let localStream: MediaStream|null = null;//안전한 종료

        const startCamera = async () => {
            try{
                //웹캠 권한 요청
                const webcamStream = await navigator.mediaDevices.getUserMedia({
                    video: {width: {ideal: 1080}, height: {ideal: 1080}, facingMode: 'user'}
                });

                localStream = webcamStream;

                if(isMounted){
                    setStream(webcamStream);
                    //<video/>와 연결
                    if(videoRef.current){
                        videoRef.current.srcObject = webcamStream;
                    }
                }else{
                    webcamStream.getTracks().forEach(track => track.stop());
                }
            }catch(error: unknown){
                if(isMounted){
                    if(error instanceof Error){
                        if(error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError'){
                        toast.error('카메라 권한이 차단되었습니다. 권한을 허용해주세요.');
                        }else{
                            toast.error('카메라를 실행하는 중 오류가 발생했습니다.');
                        }
                    }else{
                        toast.error('알 수 없는 오류가 발생했습니다.');
                    }
                    closeModal();
                }
            }
        };

        //웹캠 모달 켜질때 실행
        startCamera();

        //웹캠 모달 닫을때 실행
        return () => {
            isMounted = false;
            if(localStream){
                localStream.getTracks().forEach(track => track.stop());
            }
        };
    },[closeModal]);

    //[촬영 버튼] 1:1 비율로 화면 캡처
    const handlePhotoShoot = () => {
        if(!videoRef.current) return;
        const video = videoRef.current;

        //카메라 화면
        const canvas = document.createElement('canvas');
        const displaySize = 1080;
        canvas.width = displaySize;
        canvas.height = displaySize;
        const context = canvas.getContext('2d');

        //1:1 크롭
        const minSize = Math.min(video.videoWidth, video.videoHeight);
        const startX = (video.videoWidth - minSize)/2;
        const startY = (video.videoHeight - minSize)/2;

        context?.translate(canvas.width,0);
        context?.scale(-1,1);
        context?.drawImage(video, startX, startY, minSize, minSize, 0, 0, displaySize, displaySize);

        //canvas -> File 객체로 변환
        canvas.toBlob((blob) => {
            if(blob){
                const file = new File([blob], `webcan_${Date.now()}.jpg`, { type: 'image/jpeg' });
                const imageUrl = URL.createObjectURL(file);
                setCapturedImage(imageUrl);
                setCapturedFile(file);
            }
        }, 'image/jpeg', 0.9);
    };

    //[다시 촬영 버튼] 기존 데이터 날리고 다시 카메라 화면으로
    const handleRetake = async() => {
        if(capturedImage){
            URL.revokeObjectURL(capturedImage);
            setCapturedImage(null);
            setCapturedFile(null);
        }

        //카메라가 켜져있으면 다시 연결 (검정 화면 방어)
        if(stream && videoRef.current){
            videoRef.current.srcObject = stream;
        }else{
            try{
                //카메라도 꺼졌으면 다시 실행
                const newStream = await navigator.mediaDevices.getUserMedia({video:true});
                setStream(newStream);

                if(videoRef.current){
                    videoRef.current.srcObject = newStream;
                }
            }catch{
                toast.error("카메라를 시작할 수 없습니다.");
            }
            
        }
    };

    //[촬영한 사진 사용 버튼]
    const handlePhotoUse = () => {
        if(capturedFile){
            captureResult(capturedFile);
            closeModal();
        }
    };

    return createPortal(
        <dialog
            open
            className="fixed inset-0 z-[9999] m-0 flex h-full w-full max-h-none max-w-none items-center justify-center bg-black/90 backdrop-blur-sm p-0"
        >
            <article className="w-[90vw] max-w-[600px] rounded-3xl bg-white/95 backdrop-blur-xl border border-white/60 shadow-[0_30px_70px_rgba(0,0,0,0.2)] p-5">
                {/* 상단 영역 */}
                <header className="flex justify-between items-center mb-4">
                    <span className="text-base font-semibold text-[#2b2b31]">카메라</span>
                    <button
                        aria-label="Close"
                        onClick={closeModal}
                        className="flex items-center justify-center w-8 h-8 rounded-[10px] bg-white hover:bg-black/10 cursor-pointer transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 text-[#54545c]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                {/* 1:1 카메라 영역 */}
                <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden">
                    {!capturedImage ? (
                        //촬영 결과물 없으면 비디오 촬영 시작
                        <video
                            ref = {videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover [transform:scaleX(-1)]"
                        />
                    ) : (
                        //촬영 결과물 있으면 결과 이미지 보여주기
                        <img
                            src={capturedImage}
                            alt="카메라로 캡처한 사용자 사진"
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>

                {/* 하단 버튼 영역 */}
                <footer className="flex gap-4 mt-4">
                    {!capturedImage?(
                        <button
                            type='button'
                            onClick={handlePhotoShoot}
                            className="w-full h-11 rounded-xl bg-[#5cc8f1] text-white text-sm font-semibold cursor-pointer hover:bg-[#49b8e3] transition-colors"
                        >
                            촬영
                        </button>
                    ):(
                        <>
                            <button
                                type='button'
                                onClick={handleRetake}
                                className="w-1/2 h-11 rounded-xl bg-[white]  border border-[#49b8e3] text-[#49b8e3] text-sm font-semibold cursor-pointer hover:bg-[white]/30 transition-colors"
                            >
                                다시 촬영
                            </button>
                            <button
                                type='button'
                                onClick={handlePhotoUse}
                                className="w-1/2 h-11 rounded-xl bg-[#5cc8f1] text-white text-sm font-semibold cursor-pointer hover:bg-[#49b8e3] transition-colors"
                            >
                                이 사진 사용
                            </button>
                        </>
                    )}
                </footer>
            </article>
        </dialog>,
        document.body
    );
};