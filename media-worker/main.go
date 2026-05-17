package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"media-worker/messaging"
	"media-worker/service"
	"media-worker/storage"
	"os"

	"github.com/joho/godotenv"
)

// [타입] 자바 -> 카프카가 전달해주는 메시지 구조
type MediaProcessEvent struct {
	PostID           int64  `json:"postId"`
	VideoKey         string `json:"videoKey"`
	OriginalFileName string `json:"originalFileName"`
}

func main() {

	// 0. env 파일 로드
	err := godotenv.Load()
	if err != nil {
		log.Fatal(".env 파일을 찾을 수 없습니다.")
	}

	// 1. MiniO 연결 준비
	minioService, err := storage.NewMinioService(
		os.Getenv("MINIO_ENDPOINT"),
		os.Getenv("MINIO_ACCESS_KEY"),
		os.Getenv("MINIO_SECRET_KEY"),
		false, //🚨배포 시 true로 변경🚨
	)

	if err != nil {
		log.Fatalln("MiniO 연결 실패: ", err)
	}

	fmt.Println("✅ MiniO 연결 준비 완료!")

	// 2. Kafka 메시지 수신 준비
	kafkaConsumer, err := messaging.NewKafkaConsumer(
		[]string{"localhost:9094"},
		"media.video.process",
		"media-worker-group",
	)

	if err != nil {
		log.Fatalln("Kafka 메시지 수신 실패: ", err)
	}

	defer kafkaConsumer.Close() // 언젠가 GoWorker 서버 종료할때 대비해서 카프카 메시지 수신 닫기 예약

	// 3. 비디오 처리 과정 준비
	videoService := service.NewVideoService(minioService)

	fmt.Println("🚀 Go media-worker 시작! 메시지를 기다리는 중...")

	for {
		m, err := kafkaConsumer.GetMessage(context.Background())
		if err != nil {
			log.Fatal("메시지 읽기 실패: ", err)
			break
		}

		//형식 변환: 카프카가 전달해주는 JSON 메시지 -> GO가 읽을 수 있는 형식으로 변환
		//m.Value: JSON 형식의 데이터
		//&event: 데이터가 담길 메모리 주소
		var event MediaProcessEvent
		json.Unmarshal(m.Value, &event)

		//비동기: 비디오 처리하는 동안 다른 카프카 메시지 받기
		go videoService.ProcessPostVideo(event.VideoKey)
	}
}
