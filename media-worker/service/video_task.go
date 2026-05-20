package service

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"

	"media-worker/messaging"
	"media-worker/models"
	"media-worker/processor"
	"media-worker/storage"
)

type VideoService struct {
	Minio     *storage.MinioService     //MiniO 서비스
	Processor *processor.VideoProcessor //FFmpeg 처리기
	Producer  *messaging.KafkaProducer  //Kafka 메시지 발신
}

func NewVideoService(
	s *storage.MinioService,
	p *processor.VideoProcessor,
	kp *messaging.KafkaProducer,
) *VideoService {
	return &VideoService{
		Minio:     s,
		Processor: p,
		Producer:  kp,
	}
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

	//[보안] 정말 영상 파일인가?
	//1. 파일 무결성 검사
	file, err := os.Open(localFilePath)
	if err != nil {
		return fmt.Errorf("보안 검사 파일 열기 실패: %v", err)
	}

	//2. 파일 맨 앞 512 바이트만 읽어오기
	buffer := make([]byte, 512)
	_, err = file.Read(buffer)
	file.Close()
	if err != nil {
		return fmt.Errorf("보안 버퍼 읽기 실패: %v", err)
	}

	//3. 파일의 진짜 Type 판별
	mimeType := http.DetectContentType(buffer)
	log.Printf("🔍 업로드된 파일의 실제 타입: %s", mimeType)

	//4. 비디오 Type (video/mp4, video/quicktime 등) 아니면 차단
	if !strings.HasPrefix(mimeType, "video/") {
		log.Printf("❌ [보안 경보] 실제 비디오 파일이 아닙니다! 감지된 타입: %s", mimeType)
		return fmt.Errorf("허용되지 않는 위험한 파일 형식입니다")
	}

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
	fmt.Println("🚀 MinIO HLS 일괄 업로드 시작...")

	//5-1. 기존 카프카에서 제공하는 미니오 원본 경로 뜯어보기
	pathParts := strings.Split(videoKey, "/") // 예: posts/user_123/videos/UUID.mp4
	basePath := "posts/unknown_user"
	if len(pathParts) >= 2 {
		basePath = fmt.Sprintf("%s/%s", pathParts[0], pathParts[1]) //basePath: posts/user_123로 변경
	}

	baseName := path.Base(videoKey)               // 예: UUID.mp4
	ext := path.Ext(baseName)                     // 예: .mp4
	uniqueId := strings.TrimSuffix(baseName, ext) //예: UUID

	//5-2. 최종 업로드 경로 (예: posts/user_123/post_5/UUID)
	processedDir := fmt.Sprintf("%s/post_%d/%s", basePath, postId, uniqueId)

	//5-3. 조각난 파일들 MiniO 업로드
	err = v.Minio.UploadHLSFolder(
		"mini-sns",
		processedDir,
		tempDir,
	)
	if err != nil {
		log.Printf("❌ HLS 폴더 일괄 업로드 실패: %v", err)
	}
	fmt.Printf("✅ 미니오 HLS 업로드 성공! 경로: %s/\n", processedDir)

	//[6단계] 카프카로 자바 메인서버에 최종 주소 전송 (DB 갱신)
	//6-1. 썸네일, 최종 영상 모음 MiniO 저장 경로
	finalThumbURL := fmt.Sprintf("/mini-sns/%s/thumbnail.jpg", processedDir)
	finalMasterURL := fmt.Sprintf("/mini-sns/%s/master.m3u8", processedDir)

	//6-2. 카프카 발신 형식에 채워넣기
	completeEvent := models.VideoCompleteEvent{
		PostId:       postId,
		UniqueId:     uniqueId,
		ThumbnailUrl: finalThumbURL,
		MasterUrl:    finalMasterURL,
		Status:       "COMPLETED",
	}

	//6-3. 전송
	err = v.Producer.SendCompleteEvent(
		context.Background(),
		completeEvent,
	)
	if err != nil {
		log.Printf("❌ 자바 서버 완료 알림 전송 실패: %v", err)
	}

	//[7단계] MiniO에서 원본 파일 삭제
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
