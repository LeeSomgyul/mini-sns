import { z } from "zod";

// [게시물 댓글 추가 & 수정] 폼 유효성 검사
export const FeedCommentSchema = z.object({
    content: z.string()
        .trim()
        .min(1, "댓글 내용은 필수입니다.")
        .max(300, "댓글은 최대 300자까지만 입력할 수 있습니다.")
});