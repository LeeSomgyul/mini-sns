package storage

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type MinioService struct {
	Client *s3.Client // AWS SDK의 S3 클라이언트
}

// [1] S3 / MiniO 연결
// - endpoint: 로컬(MiniO) 접속 주소. (예: http://minisns-minio:9000). AWS 환경에서는 빈 값("")
// - accessKey, secretKey: 로컬일 때만 전달. AWS에서는 빈 값("") 전달 -> IAM Role 사용
func NewMinioService(endpoint, accessKey, secretKey, region string) (*MinioService, error) {
	// context.Background(): Go에서 비동기/타임아웃 제어를 위해 기본으로 넘겨주는 Context 객체
	ctx := context.Background()

	var cfg aws.Config
	var err error

	// region 값이 없으면 한국으로 설정
	if region == "" {
		region = "ap-northeast-2"
	}

	// 로컬 or AWS 인증 분기 처리
	if accessKey != "" && secretKey != "" {
		// 1. 로컬 처리: 키 값이 들어온 경우 로컬 MiniO 환경
		cfg, err = config.LoadDefaultConfig(ctx,
			config.WithRegion(region),
			config.WithCredentialsProvider(
				credentials.NewStaticCredentialsProvider(accessKey, secretKey, ""),
			),
		)
	}else{
		// 2. AWS 처리: 키 값이 공백이면 AWS EC2 환경
		cfg, err = config.LoadDefaultConfig(ctx, config.WithRegion(region))
	}

	if err != nil {
		return nil, err
	}

	// 클라이언트 생성 (AWS S3 전용 통신 도구)
	client := s3.NewFromConfig(cfg, func(o *s3.Options){
		// 로컬(MiniO) 일 때만 주소를 직접 지정
		if endpoint != "" {
			o.BaseEndpoint = aws.String(endpoint)
			o.UsePathStyle = true 
		}
	})

	return &MinioService{Client: client}, nil
}

// [작업할 영상 파일을 S3 또는 MiniO에서 GoWorker의 작업 폴더로 가져오기]
func (m *MinioService) DownloadFile(bucketName, objectName, localFilePath string) error {
	// 1. 파일 직접 만들기
	file, err := os.Create(localFilePath)
	if err != nil {
		return fmt.Errorf("로컬 파일 생성 실패: %w", err)
	}
	defer file.Close()

	// 2. 파일에 데이터 쓰기
	downloader := manager.NewDownloader(m.Client)
	_, err = downloader.Download(context.Background(), file, &s3.GetObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(objectName),
	})

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

// [결과물을 S3 또는 MiniO에 업로드]
func (m *MinioService) UploadFile(bucketName, objectName, localFilePath, contentType string) error {
	// 1. 파일 직접 열기
	file, err := os.Open(localFilePath)
	if err != nil {
		return fmt.Errorf("업로드할 파일 열기 실패: %w", err)
	}
	defer file.Close()

	// 2. 파일 저장
	uploader := manager.NewUploader(m.Client)
	_, err = uploader.Upload(context.Background(), &s3.PutObjectInput{
		Bucket:      aws.String(bucketName),
		Key:         aws.String(objectName),
		Body:        file,
		ContentType: aws.String(contentType),
	})

	return err
}

// [S3 또는 MiniO에서 원본 파일 제거]
func (m *MinioService) DeleteFile(bucketName, objectName string) error {
	_, err := m.Client.DeleteObject(context.Background(), &s3.DeleteObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(objectName),
	})

	if err != nil {
		return fmt.Errorf("S3 파일 삭제 실패: %w", err)
	}

	return nil
}
