import { z } from "zod";
import type { SelectedMediaType } from "../types/SelectedMediaType";
import type { TagUserType } from "../types/TagUserType";

//[게시물 등록] 유효성 검사
export const postSchema = z.object({
    // 사용자가 등록한 미디어 목록 검사
    mediaList: z.custom<SelectedMediaType[]>()
        .refine((list) => list && list.length > 0, {
            message: "이미지 또는 영상을 1개 이상 등록해주세요.",
        })
        .refine((list) => list && list.length <= 5, {
            message: "미디어는 최대 5개까지만 등록 가능합니다.",
        }),
        
    // 게시글 본문 텍스트 검사
    content: z.string()
        .trim()
        .min(1, "내용을 입력해주세요.")
        .max(500, "최대 500자까지만 입력할 수 있습니다."),
    
    // 태그된 유저 목록 검사
    tagUsers: z.custom<TagUserType[]>(),
});

// 입력 데이터 타입
export type PostFormValues = z.infer<typeof postSchema>;