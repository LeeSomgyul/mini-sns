import http from 'k6/http';
import { check, sleep } from 'k6';

const HOST = 'host.docker.internal';
const USER_PORT = 8081;
const FEED_PORT = 8084;

// [feed 모듈] GET /api/v1/feed 게시물 조회 테스트

// 1. 시나리오 조건
// export const options = {
//     // 가상 유저 수
//     stages: [
//         { duration: '30s', target: 20 }, // 0명 -> 20명 30초 동안 증가
//         { duration: '1m', target: 50 },  // 20명 -> 50명 1분 동안 증가
//         { duration: '1m', target: 80 },  // 50명 -> 80명 1분 동안 증가
//         { duration: '3m', target: 80 },  // 80명 3분 동안 유지
//         { duration: '30s', target: 0 },  // 80명 -> 0명 30초 동안 감소
//     ],
//     // 목표 성능 지표
//     thresholds: {
//         http_req_duration: ['p(95)<500'], // p95(95%) 응답시간: 500ms 이내
//         http_req_failed: ['rate<0.01'],   // 에러율: 1% 이내
//         checks: ['rate>0.99'],            // 체크 성공률: 99% 이상
//     },
// };

export const options = {
    vus: 3,
    duration: '10s',
    thresholds: {
        http_req_duration: ['p(95)<500'],
    },
};

// 2. JWT 토큰 발급을 위한 로그인
const accounts = [];
for(let i=0; i<10; i++){
    accounts.push({ email: `dummy${i}@test.com`, password: 'password123!' });
}

// 3. 10개 계정 모두 로그인하여 쿠키 확보 (테스트 시작 전 한 번만 실행됨)
export function setup(){
    const sessions = [];

    for(const account of accounts){
        // 로그인 시도
        const response = http.post(
            `http://${HOST}:${USER_PORT}/api/v1/auth/login`,
            JSON.stringify({ email: account.email, password: account.password, deviceToken: null }),
            { headers: { 'Content-Type': 'application/json' } }
        );

        // 로그인 실패 시 실행
        if(response.status !== 200){
            console.log(`로그인 실패: ${account.email}, status: ${response.status}, body: ${response.body}`);
            continue;
        }

        // 로그인 성공 시 실행 (응답에 담긴 쿠키들을 '이름:값' 형태로 저장)
        const cookieJar = {};
        for(const cookieName in response.cookies){
            cookieJar[cookieName] = response.cookies[cookieName][0].value;
        }
        sessions.push(cookieJar);
    }

    if(sessions.length === 0){
        throw new Error('로그인에 성공한 계정이 하나도 없습니다. 로그인 API 경로/필드를 확인하세요.');
    }

    console.log(`로그인 성공 계정 수: ${sessions.length}`);
    return { sessions };
}

// 4. k6 부하를 요청하는 vu의 쿠키 저장소에 쿠키를 넣어줌
export default function(data){
    // vu가 쿠키 1개 가져감
    const accountIndex = (__VU - 1) % data.sessions.length;
    const session = data.sessions[accountIndex];

    // vu 쿠키 보관함에 저장
    const jar = http.cookieJar();
    for (const [name, value] of Object.entries(session)) {
        jar.set(`http://${HOST}`, name, value);
    }

    // vu가 로그인 성공한 상태로 피드 조회 호출
    const response = http.get(`http://${HOST}:${FEED_PORT}/api/v1/feed?size=20`);

    // 디버깅용: VU당 처음 한 번만 상세 정보 출력
    if (__ITER === 0) {
        console.log(`[VU ${__VU}] status=${response.status}, body=${response.body}`);
    }

    // 성공 확인 후
    check(response, {
        'status is 200': (r) => r.status === 200,
    });

    // 1초 쉬었다가 반복
    sleep(1);
}