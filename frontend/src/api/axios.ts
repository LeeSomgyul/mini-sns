import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:8080',//백엔드 8080과 통신
    withCredentials: true,//RefreshToken를 쿠키를 서버로 자동 보내는것 허용
});

export default api;