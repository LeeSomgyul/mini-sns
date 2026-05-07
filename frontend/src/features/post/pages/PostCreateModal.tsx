import { useEffect } from "react";
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

    // 3. 메모리 누수 방지 로직 (watch로 mediaList의 변화를 감지)
    const mediaList = watch("mediaList");
    useEffect(() => {
        return () => {
            // 모달 닫힐 때 URL.revokeObjectURL 실행
            mediaList.forEach((media) => {
                if (media.previewUrl) {
                    URL.revokeObjectURL(media.previewUrl);
                }
            });
        };
    }, [mediaList]);

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
                            
                            {/* 에러 메시지 렌더링 (mediaList 또는 content) */}
                            {(errors.mediaList || errors.content) && (
                                <p style={{ color: 'red', fontSize: '14px', marginTop: '10px' }}>
                                    {errors.mediaList?.message || errors.content?.message}
                                </p>
                            )}

                            <footer>
                                <button type="submit" disabled={isPending}>
                                    {isPending ? '업로드 중...' : '저장'}
                                </button>
                            </footer>
                        </form>
                    </FormProvider>
                </article>
            </dialog>
        </div>
    );
}
