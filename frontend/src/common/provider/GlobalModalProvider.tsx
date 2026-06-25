import { usePostModalStore } from "../../features/post/store/usePostModalStore"
import { PostFormModal } from "../../features/post/pages/PostFormModal";

// [모달 전역 관리]
// - 모달은 항상 제일 상단에 떠야하기 때문에 common에서 관리
export const GlobalModalProvider = () => {

    // 게시물 등록 & 수정 모달
    const postModal = usePostModalStore();

    return(
        <>
            {/* 1. 게시물 등록 & 수정 모달 렌더링 */}
            {postModal.activeModal === 'write' && (
                <PostFormModal
                    closeModal={postModal.closeModal}
                    mode={postModal.modalMode}
                    postId={postModal.selectedPostId ?? undefined}
                />
            )}
        </>
    );
}