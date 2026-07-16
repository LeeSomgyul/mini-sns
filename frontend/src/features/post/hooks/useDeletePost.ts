import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postApi } from "../api/postApi";
import toast from 'react-hot-toast';
import { FEED_KEYS, PROFILE_KEYS } from "../../../constants/queryKey";
import { type PostUserProfileResponse } from "../../profile/types/PostUserProfileType";

interface DeletePostVariables {
    postId: number;
    userId: number;
}

interface useDeletePostProps {
    onDeleteSuccess?: () => void;
}

export const useDeletePost = ({onDeleteSuccess}: useDeletePostProps) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({postId}: DeletePostVariables) => postApi.deletePost(postId),
        
        onMutate: async ({ userId }) => {
            const userKey = PROFILE_KEYS.user(userId);

            // 유저 프로필 정보 쿼리가 돌고 있다면 잠시 멈춤
            await queryClient.cancelQueries({ queryKey: userKey });

            // 에러 시 복구용 기존 스냅샷 백업 (네 유저 프로필 응답 타입으로 대입해줘!)
            const previousUser = queryClient.getQueryData<PostUserProfileResponse>(userKey);

            // 사용자 정보 낙관적 업데이트
            if (previousUser) {
                queryClient.setQueryData<any>(userKey, (oldUser: PostUserProfileResponse) => {
                    if (!oldUser) return oldUser;
                    return {
                        ...oldUser,
                        // 기존 게시물 수에서 안전하게 1 빼기
                        postCount: Math.max(0, (oldUser.postCount ?? 0) - 1)
                    };
                });
            }

            // 실패했을 때 되돌릴 스냅샷을 context로 넘김
            return { previousUser };
        },
        
        // postId: 제거 대상 id
        onSuccess: (_data, variables: DeletePostVariables) => {

            const { postId, userId } = variables;

            // 1. 홈의 타임라인 피드 전체 캐시 무효화
            queryClient.invalidateQueries({ queryKey: FEED_KEYS.all });

            // 2. 프로필 우측 그리드 썸네일 캐시 무효화
            queryClient.invalidateQueries({queryKey: PROFILE_KEYS.post(userId)});

            // 3. 프로필 상단 헤더 게시물 개수 캐시 무효화
            queryClient.invalidateQueries({queryKey: PROFILE_KEYS.user(userId)});

            // 4. 프로필 좌측 게시물 캐시 무효화
            queryClient.invalidateQueries({queryKey: FEED_KEYS.detail(postId)});

            toast.success("게시물이 성공적으로 삭제되었습니다.");

            if(onDeleteSuccess){
                onDeleteSuccess();
            }
        },
        onError: (error) => {
            console.error('게시물 삭제 실패: ', error);
            queryClient.invalidateQueries({queryKey: FEED_KEYS.all});
            queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.all });
        }
    });
};