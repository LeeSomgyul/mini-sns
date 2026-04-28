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
        <input
            type="search"
            placeholder="이름이나 닉네임을 입력해주세요."
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
        />
    );
};