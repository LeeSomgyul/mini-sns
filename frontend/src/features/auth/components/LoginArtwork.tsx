import { motion } from "framer-motion";

type FeedStreamConfig = {
    side: "left" | "right";
    delay: number;
    gradient: string;
    reactionText: string;
    eyebrowPath: string;
};

const STREAMS: FeedStreamConfig[] = [
    {
        side: "left",
        delay: 0,
        gradient: "linear-gradient(135deg,#eef6fb,#f7f2e9)",
        reactionText: "멋져요!",
        eyebrowPath: "M6 8c1-3 4-4.5 6-4.5s5 1.5 6 4.5",
    },
    {
        side: "right",
        delay: -4.3,
        gradient: "linear-gradient(135deg,#fbeef1,#f6f1e3)",
        reactionText: "팔로우해요!",
        eyebrowPath: "M17 9c-0.5-3-3.5-5-6.5-4.5-2.5 0.5-4 2.5-4 5",
    },
    {
        side: "left",
        delay: -8.6,
        gradient: "linear-gradient(135deg,#eef7ee,#eef6fb)",
        reactionText: "멋져요!",
        eyebrowPath: "M5 9c2-4 9-4 11 0",
    },
];

// 카드 자체의 등장/이탈(지그재그 위로 흐르는 움직임)
const streamTransition = (delay: number) => ({
    duration: 13,
    ease: "linear" as const,
    repeat: Infinity,
    delay,
    times: [0, 0.08, 0.45, 0.82, 1],
});

// 피드 카드 내부 텍스트가 좌→우로 타이핑되듯 나타나는 움직임
const typingTransition = (delay: number) => ({
    duration: 13,
    ease: "linear" as const,
    repeat: Infinity,
    delay,
    times: [0, 0.4, 0.58, 1],
});

// 반응 말풍선이 팝업되는 움직임
const bubbleTransition = (delay: number) => ({
    duration: 13,
    ease: "linear" as const,
    repeat: Infinity,
    delay,
    times: [0, 0.44, 0.5, 0.58, 1],
});

// 하트가 통통 튀어 오르며 사라지는 움직임
const heartTransition = (delay: number) => ({
    duration: 13,
    ease: "linear" as const,
    repeat: Infinity,
    delay,
    times: [0, 0.42, 0.5, 0.62, 0.78, 1],
});

const FeedStream = ({ side, delay, gradient, reactionText, eyebrowPath }: FeedStreamConfig) => {
    const isLeft = side === "left";

    return (
        <motion.div
            className={`absolute top-10 flex w-[260px] flex-col gap-2.5 ${isLeft ? "left-9 items-start" : "right-9 items-end"}`}
            animate={{ y: [460, 460, 60, -220, -420], opacity: [0, 1, 1, 1, 0] }}
            transition={streamTransition(delay)}
        >
            {/* 프로필 원형 카드 */}
            <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-white shadow-[0_4px_10px_rgba(0,0,0,0.08)]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="8" fill="#eceded" />
                    <circle cx="9" cy="10" r="0.9" fill="#1c1c21" />
                    <circle cx="15" cy="10" r="0.9" fill="#1c1c21" />
                    <path d="M9 15c1.2 1 3.8 1 6 0" stroke="#1c1c21" strokeWidth="1.2" strokeLinecap="round" />
                    <path d={eyebrowPath} stroke="#1c1c21" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                </svg>
            </div>

            {/* 하얀색 둥근 사각형 피드 카드 */}
            <div className="flex w-[260px] flex-col gap-2 rounded-[18px] bg-white p-4 shadow-[0_12px_28px_rgba(20,20,30,0.10)]">
                <div className="overflow-hidden">
                    <motion.div
                        className="h-[9px] rounded bg-[#dedee2]"
                        animate={{ width: ["0%", "0%", "100%", "100%"] }}
                        transition={typingTransition(delay)}
                    />
                </div>
                <div className="h-[74px] rounded-xl" style={{ background: gradient }} />
            </div>

            {/* 유튜브 라이브 스타일 하트 & 반응 연출 */}
            <div className="relative h-10 w-[260px]">
                <motion.span
                    className={`absolute bottom-0 rounded-2xl bg-white px-3 py-1.5 text-xs text-gray-700 shadow-[0_6px_14px_rgba(20,20,30,0.08)] ${isLeft ? "left-1.5" : "right-1.5"}`}
                    animate={{ scale: [0, 0, 1.08, 1, 1], opacity: [0, 0, 1, 1, 1] }}
                    transition={bubbleTransition(delay)}
                >
                    {reactionText}
                </motion.span>
                <motion.span
                    className={`absolute bottom-0.5 text-base ${isLeft ? "left-24" : "right-32"}`}
                    animate={{ y: [0, 0, -14, -38, -70, -70], scale: [0, 0, 1.1, 0.95, 0.9, 0.9], opacity: [0, 0, 1, 1, 0, 0] }}
                    transition={heartTransition(delay + 0.3)}
                >
                    💖
                </motion.span>
                <motion.span
                    className={`absolute bottom-0 text-sm ${isLeft ? "left-[120px]" : "right-[155px]"}`}
                    animate={{ y: [0, 0, -14, -38, -70, -70], scale: [0, 0, 1.1, 0.95, 0.9, 0.9], opacity: [0, 0, 1, 1, 0, 0] }}
                    transition={heartTransition(delay + 0.9)}
                >
                    💖
                </motion.span>
            </div>
        </motion.div>
    );
};

const LoginArtwork = () => {
    return (
        <div className="absolute inset-0 overflow-hidden">
            {STREAMS.map((stream, index) => (
                <FeedStream key={index} {...stream} />
            ))}
        </div>
    );
};

export default LoginArtwork;
