import React from 'react';

interface SearchInputProps{
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

//[자식 컴포넌트] 입력창 UI 
//value: 사용자가 실시간 입력하는 값
//onChange: 사용자가 키보드 하나씩 입력할때마다 실행되는 함수
//onKeyDown: 사용자가 입력 후 enter키 눌렀을 경우 실행되는 함수 (0.5초 기다리지 않음)
export const SearchInput = ({value, onChange, onKeyDown}: SearchInputProps) => {
    return(
        <div className="relative flex-1 flex items-center group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-5 absolute left-3.5 text-[#b3b3ba] group-focus-within:text-[#5cc8f1]">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
            placeholder="이름이나 닉네임을 입력해주세요."
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            className="w-full rounded-2xl bg-[#f4f4f6] border-0 px-4 py-3 text-sm text-[#3a3a41] placeholder:text-[#b3b3ba] outline-none focus:ring-2 focus:ring-[#5cc8f1]/40 pl-10"
        />
        </div>
    );
};