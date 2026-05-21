package storage

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type MinioService struct {
	Client *minio.Client
}

// [MiniO 서버와 연결]
func NewMinioService(endpoint, accessKey, secretKey string, useSSL bool) (*MinioService, error) {
	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: useSSL,
	})

	if err != nil {
		return nil, err
	}

	return &MinioService{Client: client}, nil
}

// [작업할 영상 파일을 MiniO에서 GoWorker의 작업 폴더로 가져오기]
func (m *MinioService) DownloadFile(bucketName, objectName, localFilePath string) error {

	err := m.Client.FGetObject(
		context.Background(),     //이 함수는 타임아웃 없이 실행
		bucketName,               //버킷 이름
		objectName,               //MiniO의 원본 파일 주소
		localFilePath,            //어디로 파일 전송할 것인지
		minio.GetObjectOptions{}, //추가 옵션(없음)
	)

	return err
}

// [임시 폴더(tempDir)에서 HLS 관련 파일만 MiniO에 저장하기 쉽게 변경]
func (m *MinioService) UploadHLSFolder(bucketName, baseObjectDir, tempDir string) error {
	//1. tempDir 안에 있는 모든 파일 스캔
	files, err := os.ReadDir(tempDir)
	if err != nil {
		return fmt.Errorf("임시 폴더를 읽을 수 없습니다.: %v", err)
	}

	//2. 스캔한 파일을 하나씩 꺼내서 분류
	for _, file := range files {

		//2-1. 폴더라면 건너 뜀 (쪼개진 HLS 파일만 필요)
		if file.IsDir() {
			continue
		}

		//2-2. 파일 찾기(썸네일, 720p, 1080p)
		fileName := file.Name()
		localFilePath := filepath.Join(tempDir, fileName)

		//2-3. 새롭게 MiniO에 저장할 경로 + 파일명 (예: posts/user_123/post_5/랜덤UUID/stream_720.m3u8)
		objectName := fmt.Sprintf("%s/%s", baseObjectDir, fileName)

		//2-4. 확장자 추출
		ext := strings.ToLower(filepath.Ext(fileName))
		var contentType string

		//2-5. 파일 타입 명시 (나중에 브라우저에게 알려줘야함)
		switch ext {
		case ".m3u8":
			contentType = "application/x-mpegURL"
		case ".ts":
			contentType = "video/MP2T"
		case ".jpg", ".jpeg":
			contentType = "image/jpeg"
		case ".mp4":
			continue //임시 원본 파일은 제거할거라서 업로드 제외
		default:
			contentType = "application/octet-stream"
		}

		err := m.UploadFile(bucketName, objectName, localFilePath, contentType)
		if err != nil {
			return fmt.Errorf("❌ 업로드 실패 (%s): %v", fileName, err)
		}
	}

	return nil
}

// [결과물을 MiniO에 업로드]
func (m *MinioService) UploadFile(bucketName, objectName, localFilePath, contentType string) error {

	_, err := m.Client.FPutObject(
		context.Background(),
		bucketName,
		objectName,    //저장될 경로
		localFilePath, //저장할 미디어가 들어있는 임시 폴더
		minio.PutObjectOptions{
			ContentType: contentType, //"image/jpeg" or "video/mp4"
		},
	)

	return err
}

// [MiniO에서 원본 파일 제거]
func (m *MinioService) DeleteFile(bucketName, objectName string) error {
	err := m.Client.RemoveObject(
		context.Background(),
		bucketName,
		objectName,
		minio.RemoveObjectOptions{},
	)

	if err != nil {
		return fmt.Errorf("MinIO 파일 삭제 실패: %w", err)
	}

	return nil
}
