export interface FeedParams{
    cursorId: number | null;
    size?: number;
    signal?: AbortSignal;
}