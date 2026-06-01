//[피드 날짜 형식]
//@param dateString: 백엔드 응답으로 받은 createdAt 문자열 (예: "2026-05-29T12:00:00Z")
//@return 조건에 맞게 가공된 문자열 
export const formatFeedDate = (dateString: string): string => {

    const now = new Date();
    const targetDate = new Date(dateString);

    //현재-작성일자 날짜 차이를 ms 단위로 계산
    const diffInMs = now.getTime() - targetDate.getTime();

    //밀리초를 분, 시간, 일 단위로 계산
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    // [조건 1] 1시간(60분) 미만인 경우 => "방금 전" or "n분 전"
    if(diffInMinutes < 60){
        if(diffInMinutes < 1) return "방금 전";
        return `${diffInMinutes}분 전`;
    }

    // [조건 2] 24시간 미만인 경우 => "n시간 전"
    if(diffInHours < 24){
        return `${diffInHours}시간 전`;
    }

    // [조건 3] 7일 이내인 경우 => "n일 전"
    if(diffInDays <= 7){
        return `${diffInDays}일 전`;
    }

    // [조건 4] 7일 초과인 경우 => "0000년 00월 00일"
    return targetDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};