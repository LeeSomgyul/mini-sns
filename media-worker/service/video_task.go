package service

import (
	"fmt"
	"log"
	"os"
	"path"
	"path/filepath"
	"strings"

	"media-worker/processor"
	"media-worker/storage"
)

type VideoService struct {
	Minio     *storage.MinioService
	Processor *processor.VideoProcessor
}

func NewVideoService(s *storage.MinioService) *VideoService {
	return &VideoService{Minio: s}
}

// [영상 1개를 처리하기 위한 전체 프로세스]
func (v *VideoService) ProcessPostVideo(videoKey string, postId int64) error {

	//[1단계] 작업 공간 생성
	//tempDir: MiniO에서 복사된 영상이 담길 폴더
	tempDir, err := os.MkdirTemp("", "worker-*")
	if err != nil {
		log.Printf("❌ 임시 폴더 생성 실패: %v", err)
		return err
	}

	//작동 예약: 영상 작업 끝나면(1~4단계) 임시 보관 장소 제거
	defer os.RemoveAll(tempDir)

	//MiniO에서 복사된 영상이 담길 최종 경로 (폴더 + 파일명)
	localFilePath := filepath.Join(tempDir, "original_video.mp4")

	//[2단계] MiniO에서 작업할 영상 파일 가져오기
	err = v.Minio.DownloadFile(
		"mini-sns",
		videoKey,
		localFilePath,
	)
	if err != nil {
		log.Printf("❌ 다운로드 실패: %v", err)
		return err
	}

	fmt.Printf("✅ 다운로드 완료: %s\n", localFilePath)

	//[3단계] 썸네일 추출
	thumbPath, err := v.Processor.ExtractThumbnail(tempDir)
	if err != nil {
		log.Panicf("❌ 썸네일 추출 실패: %v", err)
		return err
	}

	fmt.Printf("✅ 썸네일 생성 완료 (%s)\n", thumbPath)

	//[4단계] 다중 해상도 가공
	videoPaths, err := v.Processor.ResolutionVideos(tempDir)
	if err != nil {
		log.Printf("❌ 영상 가공 실패: %v", err)
		return err
	}

	fmt.Printf("✅ 영상 해상도 가공 완료\n")
	for resolution, path := range videoPaths {
		fmt.Printf("%sp 버전: %s\n", resolution, path)
	}

	//[5단계] MiniO 업로드
	fmt.Println("🚀 MinIO 업로드 시작...")

	//5-1. 기존 카프카에서 제공하는 미니오 원본 경로 뜯어보기
	pathParts := strings.Split(videoKey, "/") // 예: posts/user_123/videos/랜덤.mp4
	basePath := "posts/unknown_user"

	if len(pathParts) >= 2 {
		basePath = fmt.Sprintf("%s/%s", pathParts[0], pathParts[1]) //basePath: posts/user_123로 변경
	}

	processedDir := fmt.Sprintf("%s/post_%d", basePath, postId) //최종 업로드 경로 (예: posts/user_123/post_5/processed)

	baseName := path.Base(videoKey) //원본 MiniO 경로의 이름만 추출 (예: 랜덤.mp4)
	ext := path.Ext(baseName)       //확장자 (예: .mp4)

	uniqueId := strings.TrimSuffix(baseName, ext) //원본 이름에서 확장자 제거 (예: 랜덤)

	//5-2. 썸네일 업로드
	thumbKey := fmt.Sprintf("%s/%s_thumbnail.jpg", processedDir, uniqueId) // 예: posts/user_123/post_5/랜덤_thumbnail.jpg

	err = v.Minio.UploadFile(
		"mini-sns",
		thumbKey,
		thumbPath,
		"image/jpeg",
	)

	if err != nil {
		log.Printf("❌ 썸네일 업로드 실패: %v", err)
	} else {
		fmt.Printf("썸네일 업로드 성공: %s\n", thumbKey)
	}

	//5-3. 다중 해상도 영상 업로드
	for resolution, videoPath := range videoPaths {
		videlKey := fmt.Sprintf("%s/%s_%s.mp4", processedDir, uniqueId, resolution) // 예: posts/user_123/post_5/랜덤_video_720.mp4

		err := v.Minio.UploadFile(
			"mini-sns",
			videlKey,
			videoPath,
			"video/mp4",
		)

		if err != nil {
			log.Panicf("❌ %s 화질 업로드 실패: %v", resolution, err)
		} else {
			fmt.Printf("%s 영상 MiniO 저장 완료: %s\n", resolution, videoKey)
		}
	}

	//[6단계] MiniO에서 원본 파일 삭제
	fmt.Printf("[post_%d] 원본 파일 삭제 시도: %s\n", postId, videoKey)

	err = v.Minio.DeleteFile(
		"mini-sns",
		videoKey,
	)

	if err != nil {
		log.Printf("⚠️ 원본 파일 삭제 실패: %v\n", err)
	} else {
		fmt.Printf("✅ [post_%d] 원본 파일(%s) 삭제 성공!\n", postId, uniqueId)
	}

	fmt.Printf("🎉 [post_%d] %s 미디어 인코딩 및 파이프라인 모두 성공!\n", postId, uniqueId)
	return nil
}
