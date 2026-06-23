import { create } from "zustand";

interface ModalState{
    // 1. 현재 화면에 띄울 모달 종류 지정
    // - write: 피드 폼 화면
    // - null: 모달 닫기
    activeModal: 'write' | null;

    // 2. 피드 폼 모달이 열렸을 때 내부 실행 모드
    // - create: 새로운 게시물 등록 모드
    // - edit: 기존 작성한 게시물 수정 모드
    modalMode: 'create' | 'edit';

    // 3. modalMode = 'edit' 일 경우 어떤 게시물을 선택하는지 postId
    selectedPostId: number | null;

    // 4. 피드 작성 버튼 눌렀을 경우 호출 함수
    openCreateModal: () => void;

    // 5. 피드 수정 버튼 눌렀을 경우 호출 함수
    openEditModal: (postId: number) => void;

    // 6. 모달 닫기 호출 함수
    closeModal: () => void;
}

export const usePostModalStore = create<ModalState>((set) => ({
    // 초기값 세팅
    activeModal: null,
    modalMode: 'create',
    selectedPostId: null,

    // [피드 작성] 버튼 눌렀을 경우 초기 세팅
    openCreateModal: () => set({
        activeModal: 'write',
        modalMode: 'create',
        selectedPostId: null
    }),

    // [피드 수정] 버튼 눌렀을 경우 초기 세팅
    openEditModal: (postId) => set({
        activeModal: 'write',
        modalMode: 'edit',
        selectedPostId: postId
    }),

    // [닫기] 버튼 눌렀을 경우 초기 세팅
    closeModal: () => set({
        activeModal: null,
        selectedPostId: null
    })
}));