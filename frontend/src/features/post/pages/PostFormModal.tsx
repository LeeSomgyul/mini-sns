import { useEffect, useRef } from "react";
import { createPortal } from 'react-dom';
import { useBlocker } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from '@tanstack/react-query';

import { postSchema, type PostFormValues } from "../schemas/postSchema";
import { useCreatePostMutation } from "../hooks/useCreatePostMutation";
import { useUpdatePostMutation } from "../hooks/useUpdatePostMutation";
import { postApi } from "../api/postApi";
import { type MediaResponse } from "../types/postTypes";

import PostMediaUploader from "./PostMediaUploader"; 
import PostDescription from "./PostDescription";
import PostTag from "./PostTag";

interface PostFormModalProps {
    closeModal: () => void;
    mode: 'create' | 'edit';
    postId?: number;
}

export const PostFormModal = ({ closeModal, mode, postId }: PostFormModalProps) => {
    // 해당 모달의 모드
    const isEdit = mode == 'edit';

    // 1. [게시물 수정 전용] 기존 데이터 조회
    const {data: postData, isLoading: isPostLoading} = useQuery({
        queryKey: ['feeds', 'edit', postId],    //불러온 데이터가 저장될 공간
        queryFn: () => postApi.getPostForEdit(postId!),
        enabled: isEdit && !!postId //수정 모드이면서 postId가 존재할 때만 실행
    });

    // 2-1. 리엑트 훅 라이브러리 초기 세팅
    const methods = useForm<PostFormValues>({
        resolver: zodResolver(postSchema),
        defaultValues: {
            mediaList: [],
            content: '',
            tagUsers: []
        },
        mode: "onSubmit",
    });

    // 2-2. 리엑트 훅 라이브러리 기능 가져오기
    const { 
        handleSubmit, //입력 폼 작성하고 저장버튼 누르면 유효성 검사 실행 후 백엔드로 데이터 넘기기
        watch, //폼 내부의 값이 실시간으로 바뀌는것 관찰 및 리턴
        reset, //폼 초기화 or 원하는 값으로 넣기
        formState: { errors, isDirty } //isDirty: 폼 수정여부 확인 감지
    } = methods;

    // 3. [게시물 수정 전용] 수정 상태라면 이전 게시물 불러오기 
    useEffect(() => {
        if(isEdit && postData){
            reset({
                mediaList: postData.mediaList.map((media: MediaResponse) => ({
                    mediaId: media.mediaId,
                    type: media.type,
                    url: media.url,
                    thumbnailUrl: media.thumbnailUrl,
                    sortOrder: media.sortOrder,
                    status: 'SUCCESS',  //게시물 수정 완료 상태
                    previewUrl: media.url   //리엑트는 파일 경로를 previewUrl에서 찾음
                }))
            });
        }
    },[postData?.postId, isEdit, reset])

    // 4. 게시물 생성 & 게시물 수정 훅
    const createMutation = useCreatePostMutation({closeModal});
    const updateMutation = useUpdatePostMutation({closeModal});
    const isPending = createMutation.isPending || updateMutation.isPending;

    // 5-1. 입력되고 있는 데이터가 있는지 감시
    const mediaList = watch("mediaList");
    const content = watch("content");
    const tagUsers = watch("tagUsers");

    // 5-2. 미디어 업로드 상태 확인(minio로 업로드 중인가?)
    const isMediaUploading = mediaList.some(media => media.status === 'UPLOADING');

    // 6. 작성중인 데이터 유무
    // - 게시물 생성: 기존 내용이 한 글자라도 있으면 다른 페이지 이탈 방지
    // - 수정 모드: 데이터가 최초 불러온 상태랑 다르면 이탈 방지
    const hasUnsavedChanges = !isEdit
        ?(mediaList.length > 0 || content.trim() !== '' || tagUsers.length > 0)
        : isDirty;

    // 7-1. 뒤로가기, 페이지 이동 방지
    useBlocker(
        ({currentLocation, nextLocation}) =>
            hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
    );

    // 7-2. 작성중인 데이터가 있다면 새로고침/창 닫기 방지
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

    // 8-1. 백엔드 저장 후 프론트 메모리에서 데이터 제거 선언
    const mediaListRef = useRef(mediaList);

    // 8-2. 최신 상태를 새로고침 하지 않고 바로 업데이트
    useEffect(() => {
        mediaListRef.current = mediaList;
    }, [mediaList]);

    // 8-3. 모달 닫힐 때 메모리 데이터 삭제
    useEffect(() => {
        return () => {
            mediaListRef.current.forEach((media) => {
                if (media.previewUrl) {
                    URL.revokeObjectURL(media.previewUrl);
                }
            });
        };
    }, []);

    // 9. 업로드 상태에 따른 '저장' 버튼 텍스트 변경
    const getButtonText = () => {
      if(isMediaUploading) return '미디어 업로드 중...';
      if(isPending) return '게시물 저장 중...';
      return '저장';  
    };

    // 10. 최종 저장 API 실행 (유효성 검사 통과 시 실행됨)
    const onSubmit = (data: PostFormValues) => {
        if(isEdit && postId){
            updateMutation.mutate({postId, data});
        }else{
            createMutation.mutate(data);
        }
    };

    //=================================================================================

    // [게시물 수정 전용] 초기 데이터 로딩 스켈레톤
    if(isEdit && isPostLoading){
        return createPortal(
            <dialog open style={{ zIndex: 9999 }}><article>데이터를 불러오는 중입니다...</article></dialog>,
            document.body
        );
    }

    return createPortal(
        <div>
            <dialog open style={{ zIndex: 9999 }}>
                <article style={{ width: '90vw', maxWidth: '1000px' }}>
                    <header>
                        <button aria-label="Close" className="close" onClick={closeModal}></button>
                        <span>{isEdit ? '피드 수정' : '피드 작성'}</span>
                    </header>

                    <FormProvider {...methods}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid">
                                <div>
                                    {/* 기존에 넘겨주던 props(mediaList, setMediaList 등)를 싹 지웁니다! */}
                                    <PostMediaUploader mode={mode}/>
                                </div>
                                <div>
                                    <PostDescription mode={mode}/>
                                </div>
                                <div>
                                    <PostTag mode={mode}/>
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

                            <button type="submit" disabled={isPending || isMediaUploading || (isEdit && !isDirty)}>
                                {getButtonText()}
                            </button>
                        </form>
                    </FormProvider>
                </article>
            </dialog>
        </div>,
        document.body
    );
}
