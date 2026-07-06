// [프로필 숫자 표기 형식]
export const formatCount = (count: number): string => {
  if (count < 1000) return count.toString();
  
  if (count < 1000000) {
    // 1,000 ~ 999,999 -> K (소수점 첫째 자리까지)
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  
  // 1,000,000 이상 -> M (소수점 첫째 자리까지)
  return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
};