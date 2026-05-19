package models

// [타입] 카프카 메시지 수신 형식
type MediaProcessEvent struct {
	PostID           int64  `json:"postId"`
	VideoKey         string `json:"videoKey"`
	OriginalFileName string `json:"originalFileName"`
}

// [타입] 카프카 메시지 발신 형식
type VideoCompleteEvent struct {
	PostId        int64  `json:"postId"`
	UniqueId      string `json:"uniqueId"`
	ThumbnailUrl  string `json:"thumbnailUrl"`
	VideoUrl720p  string `json:"videoUrl720p"`
	VideoUrl1080p string `json:"videoUrl1080p"`
	Status        string `json:"status"`
}
