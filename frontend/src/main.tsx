import "@picocss/pico/css/pico.min.css";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import toast from "react-hot-toast";
import {isAxiosError} from 'axios';
import { ROUTES } from "./constants/routes.ts";

//탄스택쿼리 설정
const queryClient = new QueryClient({
  //GET 전역 메시지 처리
  queryCache: new QueryCache({
    //query: 데이터 가져오기
    onError: (error: unknown, query) => {
      if(isAxiosError(error)){
        if(error.response?.status === 401){
          toast.error('로그인이 만료되었습니다. 다시 로그인해 주세요.');
          window.location.href = ROUTES.LOGIN;
        }
      }else if(error instanceof Error){
        console.log(`[시스템 에러]:`,error.message);
      }
      
      if(typeof query.meta?.errorMessage === 'string'){
        toast.error(query.meta.errorMessage);
      }
    },
  }),
  //POST, PUT, PATCH, DELETE 전역 메시지 처리
  mutationCache: new MutationCache({
    //mutation: 데이터 바꾸기
    onError: (error: unknown, _variables, _context, mutation) => {
      if(typeof mutation.meta?.errorMessage === 'string'){
        toast.error(mutation.meta.errorMessage);
      }else if(isAxiosError(error) && error.response?.status && error.response.status >= 500){
        toast.error('서버 응답 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      }else{
        toast.error('요청을 처리하지 못했습니다.');
      }
    },
    onSuccess: (_data, _variables, _context, mutation) => {
      if(typeof mutation.meta?.successMessage === 'string'){
        toast.success(mutation.meta.successMessage);
      }
    },
  }),
  //기본 설정
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,//탭 전환 시 불필요한 재요청 방지
      staleTime: 1000 * 60,//1분간은 신선한 데이터라고 생각
      retry: 1, //실패 시 1번만 재시도 
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false}/>
    </QueryClientProvider>
  </StrictMode>,
)
