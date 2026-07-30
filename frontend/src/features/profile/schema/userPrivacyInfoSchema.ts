import { z } from "zod";

// [프로필 개인정보 수정] 폼 유효성 검사
export const userPrivacyInfoSchema = z.object({
    // 1-1. 닉네임: 2~10자, 한글/영문/숫자만 가능
    nickname: z
        .string()
        .min(2, '닉네임은 2~10자 이내로 입력해주세요.')
        .max(10, '닉네임은 2~10자 이내로 입력해주세요.')
        .regex(/^[가-힣a-zA-Z0-9]{2,10}$/, '닉네임은 한글, 영문, 숫자만 가능합니다. (자음/모음 단독 입력 불가)'),

    // 1-2. 닉네임 중복체크 여부
    isNicknameChecked: z.boolean().refine((val) => val === true, {
        message: "닉네임 중복 확인을 완료해 주세요."
    }),

    // 2. 전화번호: 11자리 숫자 가능, 빈 값 허용
    phoneNumber: z
        .string()
        .regex(/^[0-9]{11}$/, '전화번호는 11자리 숫자만 가능합니다.')
        .or(z.literal(''))
        .nullable()
        .transform((val) => (val === '' ? null : val)),
    
    // 3-1. 비밀번호 변경 토글이 켜져있는지 여부
    isPasswordChanging: z.boolean(),

    // 3-2. 비밀번호는 변경 할 수도 있고 안할수도 있기 때문에, 값이 비어있어도 유효성 검사 통과
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
}).superRefine((data, ctx) => {


    // 3-3. 사용자가 비밀번호 변경 토글 클릭해서 비밀번호 변경으로 진입하면 superRefine 실행
    if (data.isPasswordChanging) {
    
        // 현재 비밀번호 검증
        if (!data.currentPassword || data.currentPassword.trim() === '') {
            ctx.addIssue({
                code: "custom",
                path: ['currentPassword'],
                message: '현재 비밀번호를 입력해주세요.',
            });
        }

        // 새 비밀번호 검증
        if (!data.newPassword || data.newPassword.trim() === '') {
            ctx.addIssue({
                code: "custom", 
                message: '새 비밀번호를 입력해주세요.',
                path: ['newPassword'],
            });
        } else {
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{10,20}$/;
            
            if (!passwordRegex.test(data.newPassword)) {
                ctx.addIssue({
                code: "custom", 
                message: '비밀번호는 10~20자, 영문/숫자/특수문자를 포함해야 합니다.',
                path: ['newPassword'],
                });
            }
        }

        // 새 비밀번호 확인 일치 여부 검증
        if (data.newPassword !== data.confirmPassword) {
            ctx.addIssue({
                code: "custom",
                message: '비밀번호가 일치하지 않습니다.',
                path: ['confirmPassword'],
            });
        }
    }
});

export type UserPrivacyFormValues = z.infer<typeof userPrivacyInfoSchema>;