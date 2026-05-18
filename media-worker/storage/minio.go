package storage

import (
	"context"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type MinioService struct {
	Client *minio.Client
}

// MiniO 서버와 연결
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

// 작업할 영상 파일을 MiniO에서 GoWorker의 작업 폴더로 가져오기
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

// 결과물을 MiniO에 업로드
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
