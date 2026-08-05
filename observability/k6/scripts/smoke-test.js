import http from 'k6/http';
import { check, sleep } from 'k6';

// [k6 실행 테스트]
export const options = {
  vus: 1,          // 가짜 사용자 1명
  duration: '10s',  // 10초 동안 실행
};

// [1명이 10초동안 아래 함수 호출 -> 1초 쉬기 -> 호출 반복]
export default function () {
  const res = http.get('http://host.docker.internal:8084/api/actuator/health');

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}