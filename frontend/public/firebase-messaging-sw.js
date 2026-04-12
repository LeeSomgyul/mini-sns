//firebase 라이브러리 가져오기
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

//firebase 설정(firebase.ts와 동일)
const firebaseConfig = {
  apiKey: "AIzaSyBoGCLHQ5zzWxPC519ip-wfO1vGwn0cpus",
  authDomain: "minisns-9678d.firebaseapp.com",
  projectId: "minisns-9678d",
  storageBucket: "minisns-9678d.firebasestorage.app",
  messagingSenderId: "845345684860",
  appId: "1:845345684860:web:7e8eb5173758dd71d978f9"
};

//firebase 초기화
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

//백그라운드 알림 수신 이벤트(사이트를 꺼놨을 때도 알림 올 수 있도록)
messaging.onBackgroundMessage((payload) => {
    //알림 제목
    const notificationTitle = payload.notification.title;

    //알림 내용
    const notificationOptions ={
        body: payload.notification.body,
        icon: '/favicon.svg',//🚨🚨알림 아이콘 변경하기🚨🚨
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
})