export interface NavItemType{
    id: string;
    path: string | null;
    label: string;
    type: 'link' | 'modal';
}

export type ModalType = 'write' | 'settings' | null;