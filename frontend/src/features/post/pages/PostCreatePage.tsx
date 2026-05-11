import { useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { postSchema, type PostFormValues } from "../schemas/postSchema";
import { useCreatePostMutation } from "../hooks/useCreatePostMutation";

import PostMediaUploader from "./PostMediaUploader"; 
import PostDescription from "./PostDescription";
import PostTag from "./PostTag";

interface PostCreateModalProps {
    closeModal: () => void;
}

export const PostCreateModal = ({ closeModal }: PostCreateModalProps) => {
    // 1. React Hook Form 초기 세팅
    const methods = useForm<PostFormValues>({
        resolver: zodResolver(postSchema),
        defaultValues: {
            mediaList: [],
            content: '',
            tagUsers: []
        },
        mode: "onSubmit",
    });

    const { handleSubmit, watch, formState: { errors } } = methods;

    // 2. 비즈니스 로직(업로드)이 담긴 Custom Hook 호출
    const { mutate, isPending } = useCreatePostMutation({ closeModal });

    // 3. 입력되고 있는 데이터가 있는지 감시
    const mediaList = watch("mediaList");
    const content = watch("content");
    const tagUsers = watch("tagUsers");

    // 미디어 업로드 상태 확인(minio로 업로드 중인가?)
    const isMediaUploading = mediaList.some(media => media.status === 'UPLOADING');

    //작성중인 데이터가 있는지 유무
    const hasUnsavedChanges = mediaList.length > 0 || content.trim() !== '' || tagUsers.length > 0;

    //뒤로가기, 페이지 이동 방지
    useBlocker(
        ({currentLocation, nextLocation}) =>
            hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
    );

    //작성중인 데이터가 있다면 새로고침/창 닫기 방지
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if(hasUnsavedChanges){
                event.preventDefault();//새로고침 막기
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return() => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    },[hasUnsavedChanges]);

    const mediaListRef = useRef(mediaList);

    //최신 상태를 리렌더링 하지 않고 업데이트
    useEffect(() => {
        mediaListRef.current = mediaList;
    }, [mediaList]);

    //모달 닫힐 때 메모리 데이터 삭제
    useEffect(() => {
        return () => {
            mediaListRef.current.forEach((media) => {
                if (media.previewUrl) {
                    URL.revokeObjectURL(media.previewUrl);
                }
            });
        };
    }, []);

    // 업로드 상태에 따른 '저장' 버튼 텍스트 변경
    const getButtonText = () => {
      if(isMediaUploading) return '미디어 업로드 중...';
      if(isPending) return '게시물 저장 중...';
      return '저장';  
    };

    // 4. 최종 저장 핸들러 (유효성 검사 통과 시 실행됨)
    const onSubmit = (data: PostFormValues) => {
        mutate(data); // 데이터 통째로 mutation에 넘김
    };

    return (
        <div>
            <dialog open>
                <article style={{ width: '90vw', maxWidth: '1000px' }}>
                    <header>
                        <button aria-label="Close" className="close" onClick={closeModal}></button>
                        <span>피드 작성</span>
                    </header>

                    <FormProvider {...methods}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid">
                                <div>
                                    {/* 기존에 넘겨주던 props(mediaList, setMediaList 등)를 싹 지웁니다! */}
                                    <PostMediaUploader />
                                </div>
                                <div>
                                    <PostDescription />
                                </div>
                                <div>
                                    <PostTag />
                                </div>
                            </div>
                            
                            {/* 에러 메시지 렌더링 (postSchema.tsx) */}
                            {errors.mediaList && errors.mediaList.message !== "아직 업로드 중인 미디어가 있습니다. 잠시만 기다려주세요." && (
                                <p style={{ color: 'red', fontSize: '14px', marginTop: '10px' }}>
                                    {errors.mediaList.message}
                                </p>
                            )}

                            {errors.content && (
                                <p style={{ color: 'red', fontSize: '14px', marginTop: '10px' }}>
                                    {errors.content.message}
                                </p>
                            )}

                            <button type="submit" disabled={isPending || isMediaUploading}>
                                {getButtonText()}
                            </button>
                        </form>
                    </FormProvider>
                </article>
            </dialog>
        </div>
    );
}
