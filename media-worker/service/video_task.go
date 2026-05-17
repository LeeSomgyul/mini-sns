package service

import (
	"fmt"
	"log"
	"os"
	"path/filepath"

	"media-worker/storage"
)

type VideoService struct {
	Minio *storage.MinioService
}

func NewVideoService(s *storage.MinioService) *VideoService {
	return &VideoService{Minio: s}
}

// [영상 1개를 처리하기 위한 전체 프로세스]
func (v *VideoService) ProcessPostVideo(videoKey string) {

	//[1단계] 작업 공간 생성
	//tempDir: MiniO에서 복사된 영상이 담길 폴더
	tempDir, err := os.MkdirTemp("", "worker-*")
	if err != nil {
		log.Printf("❌ 임시 폴더 생성 실패: %v", err)
		return
	}

	//작동 예약: 영상 작업 끝나면(1~4단계) 임시 보관 장소 제거
	defer os.RemoveAll(tempDir)

	//MiniO에서 복사된 영상이 담길 최종 경로 (폴더 + 파일명)
	localFilePath := filepath.Join(tempDir, "original_video.mp4")

	//[2단계] MiniO에서 작업할 영상 파일 가져오기
	err = v.Minio.DownloadFile("mini-sns", videoKey, localFilePath)
	if err != nil {
		log.Printf("❌ 다운로드 실패: %v", err)
		return
	}

	fmt.Printf("✅ 다운로드 완료: %s\n", localFilePath)
}
