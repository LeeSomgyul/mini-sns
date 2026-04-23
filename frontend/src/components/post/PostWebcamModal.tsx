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
            }catch(error: any){
                if(isMounted){
                    console.error("웹캠 에러 상세(화면 뜰 때만):", error);
                    if(error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError'){
                        toast.error('카메라 권한이 차단되었습니다. 권한을 허용해주세요.');
                    }else{
                        toast.error('카메라를 실행하는 중 오류가 발생했습니다.');
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
    const handleRetake = () => {
        if(capturedImage){
            URL.revokeObjectURL(capturedImage);
            setCapturedImage(null);
            setCapturedFile(null);
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
        <dialog open style={{ zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <article style={{ width: '90vw', maxWidth: '600px', backgroundColor: '#fff', padding: '1rem', borderRadius: '8px' }}>
                {/* 상단 영역 */}
                <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ margin: 0 }}>카메라</div>
                    <button aria-label="Close" className="close" onClick={closeModal}></button>
                </header>

                {/* 1:1 카메라 영역 */}
                <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                    {!capturedImage ? (
                        //촬영 결과물 없으면 비디오 촬영 시작
                        <video
                            ref = {videoRef}
                            autoPlay
                            playsInline
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                        />
                    ) : (
                        //촬영 결과물 있으면 결과 이미지 보여주기
                        <img
                            src={capturedImage}
                            alt="카메라로 캡처한 사용자 사진"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                        />
                    )}
                </div>

                {/* 하단 버튼 영역 */}
                <footer style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    {!capturedImage?(
                        <button type='button' onClick={handlePhotoShoot} style={{ width: '100%' }}>촬영</button>
                    ):(
                        <>
                            <button type='button' onClick={handleRetake} style={{ width: '50%' }}>다시 촬영</button>
                            <button type='button' onClick={handlePhotoUse} style={{ width: '50%' }}>이 사진 사용</button>
                        </>
                    )}
                </footer>
            </article>
        </dialog>,
        document.body
    );
};