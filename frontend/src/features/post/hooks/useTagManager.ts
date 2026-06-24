import { useFormContext, useWatch } from 'react-hook-form';
import type { PostFormValues } from '../schemas/postSchema';
import type { TagUserType } from '../types/TagUserType';

// [태그 폼 데이터 관리]
export const useTagManager = () => {
    const { setValue, control } = useFormContext<PostFormValues>();

    // [태그 조회]
    // 리엑트 훅 폼을 뒤져서 현재 태그된 유저 목록 가져오기 (초기값은 빈 배열)
    const tagUsers = useWatch({
        name: 'tagUsers',
        control,
        defaultValue: []
    });

    // [태그 추가]
    const handleAddTag = (selectedUsers: TagUserType[]) => {
        setValue('tagUsers', [...selectedUsers], {
            shouldValidate: true,
            shouldDirty: true
        });
    };

    // [태그 삭제]
    const handleRemoveTag = (userId: number) => {
        const updatedTags = tagUsers.filter(user => user.userId !== userId);
        setValue('tagUsers', updatedTags, { shouldValidate: true, shouldDirty: true });
    };

    return {
        tagUsers,
        handleAddTag,
        handleRemoveTag
    };
};