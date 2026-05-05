import { useFormContext } from 'react-hook-form';
import type { PostFormValues } from '../schemas/postSchema';
import type { TagUserType } from '../types/TagUserType';

export const useTagMutation = () => {
    const { watch, setValue } = useFormContext<PostFormValues>();

    // 현재 태그된 유저 목록 가져오기 (초기값은 빈 배열)
    const tagUsers = watch('tagUsers') || [];

    // [태그 추가] 🚨🚨임시(실제 태그 추가 기능으로 수정하기)🚨🚨
    const handleAddTag = () => {
        const newUser: TagUserType = {
            userId: Math.floor(Math.random() * 1000),
            nickname: `유저${tagUsers.length + 1}`,
            name: `이름${tagUsers.length + 1}`
        };

        setValue('tagUsers', [...tagUsers, newUser], { shouldValidate: true });
    };

    // [태그 삭제]
    const handleRemoveTag = (userId: number) => {
        const newTags = tagUsers.filter(user => user.userId !== userId);
        setValue('tagUsers', newTags, { shouldValidate: true });
    };

    return {
        tagUsers,
        handleAddTag,
        handleRemoveTag
    };
};