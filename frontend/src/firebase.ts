import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

//발급받은 설정값
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

//파이어베이스 시작
const app = initializeApp(firebaseConfig);

//메시지기능(알림에서 사용) 가져오기
const messaging = getMessaging(app);

//deviceToken 가져오는 메서드
export const getDeviceToken = async (): Promise<string | null> => {
    try{
        //사용자의 브라우저에 알림 권한 요청 팝업 띄우기
        const permission = await Notification.requestPermission();

        //사용자가 알림 권한 거절 누르면 알림기능 사용 불가
        if(permission !== 'granted'){
            return null;
        }

        //firebase-messaging-sw.js 서비스 워커 파일 수동 연결
        if('serviceWorker' in navigator){
            //서비스 워커 길 찾아주기
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

            //서비스 워커가 활성화 될때까지 기다리기
            await navigator.serviceWorker.ready;

            //DeviceToken 발급
            const token = await getToken(messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
                serviceWorkerRegistration: registration
            });
            
            return token;
        }else{
            console.log('이 브라우저는 서비스 워커를 지원하지 않습니다.');
            return null;
        }
        
    }catch(error){
        console.log('fcm 에러 발생: ', error);
        alert('권한 설정 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
        return null;
    }
};