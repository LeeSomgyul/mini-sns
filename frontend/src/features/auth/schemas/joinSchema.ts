import {z} from 'zod';

//[회원가입] 폼 유효성 검사
export const joinSchema = z.object({
    email: z.email('올바른 이메일 형식이 아닙니다.')
        .min(1,'필수 입력합니다.'),
    password: z.string()
        .min(10, '비밀번호는 10~20자여야 합니다.')
        .max(20, '비밀번호는 10~20자여야 합니다.')
        .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{10,20}$/, '비밀번호는 10~20자, 영문/숫자/특수문자를 포함해야 합니다.'),
    passwordConfirm: z.string()
        .min(1,'필수 입력입니다.'),
    nickname: z.string()
        .min(2, '닉네임은 2~10자 이내로 입력해주세요.')
        .max(10, '닉네임은 2~10자 이내로 입력해주세요.')
        .regex(/^[가-힣a-zA-Z0-9]{2,10}$/, '닉네임은 한글, 영문, 숫자만 가능합니다.'),
    name: z.string()
        .max(10, '이름은 10자 이내로 입력 가능합니다.')
        .regex(/^[가-힣a-zA-Z]*$/, '이름은 한글과 영문만 가능합니다.')
        .or(z.literal(''))
        .optional(),
    phoneNumber: z.string()
        .regex(/^[0-9]{11}$/, '전화번호는 11자리 숫자만 가능합니다.')
        .or(z.literal('')),
}).refine((data) => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'],
    message: '비밀번호가 일치하지 않습니다.',
});

export type JoinFormValues = z.infer<typeof joinSchema>;