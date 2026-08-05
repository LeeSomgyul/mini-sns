import http from 'k6/http';
import { check, sleep } from 'k6';

const HOST = 'host.docker.internal';
const USER_PORT = 8081;
const FEED_PORT = 8084;

// [스트레스 테스트] GET /api/v1/feed 게시물 조회

// 1. 시나리오 조건
export const options = {
    stages: [
        { duration: '30s', target: 50 },    // 0명 → 50명 (30초 동안 증가) → 50명 (30초 동안 유지)
        { duration: '30s', target: 50 },   
        { duration: '30s', target: 150 },   // 50명 → 150명 (30초 동안 증가) → 150명 (30초 동안 유지)
        { duration: '30s', target: 150 },  
        { duration: '30s', target: 300 },   // 150명 → 300명 (30초 동안 증가) → 300명 (30초 동안 유지)
        { duration: '30s', target: 300 },  
        { duration: '30s', target: 500 },   // 300명 → 500명 (30초 동안 증가) → 500명 (30초 동안 유지)
        { duration: '1m', target: 500 },   
        { duration: '30s', target: 0 },     // 500명 → 0명 (30초 동안 감소)
    ],
    thresholds: {
        // 안전장치: 에러율 50% 넘으면 테스트 자동 중단
        http_req_failed: [{ threshold: 'rate<0.50', abortOnFail: true }],
    },
};

// 2. JWT 토큰 발급을 위한 로그인
const accounts = [];
for(let i=0; i<10; i++){
    accounts.push({ email: `dummy${i}@test.com`, password: 'password123!' });
}

// 3. 10개 계정 모두 로그인하여 accessToken 확보 (테스트 시작 전 한 번만 실행됨)
export function setup() {
    const sessions = [];

    for (const account of accounts) {
        const response = http.post(
            `http://${HOST}:${USER_PORT}/api/v1/auth/login`,
            JSON.stringify({ email: account.email, password: account.password, deviceToken: null }),
            { headers: { 'Content-Type': 'application/json' } }
        );

        if (response.status !== 200) {
            console.log(`로그인 실패: ${account.email}, status: ${response.status}, body: ${response.body}`);
            continue;
        }

        // 응답 바디(JSON)에서 accessToken 꺼내기
        const body = JSON.parse(response.body);
        const accessToken = body.data.accessToken;

        sessions.push({ accessToken });
    }

    if (sessions.length === 0) {
        throw new Error('로그인에 성공한 계정이 하나도 없습니다.');
    }

    console.log(`로그인 성공 계정 수: ${sessions.length}`);
    return { sessions };
}

// 4. k6 부하를 요청하는 vu의 쿠키 저장소에 쿠키를 넣어줌
export default function (data) {
    const accountIndex = (__VU - 1) % data.sessions.length;
    const session = data.sessions[accountIndex];

    const response = http.get(`http://${HOST}:${FEED_PORT}/api/v1/feed?size=20`, {
        headers: {
            'Authorization': `Bearer ${session.accessToken}`,
        },
    });

    check(response, {
        'status is 200': (r) => r.status === 200,
    });

    sleep(1);
}