package main

import (
	"context"
	"fmt"
	"log"

	"github.com/segmentio/kafka-go"
)

func main() {

	//[카프카 주소]
	topic := "media.video.process" //메시지 저장 위치
	broker := "localhost:9094"     //도커 내부의 카프카랑 연결하기 위한 포트 번호

	//[설정]
	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers:  []string{broker},
		Topic:    topic,
		GroupID:  "media-worker-group", //나중에 영상 요청이 많아질때를 대비해서, 워커에게 동일한 이름 짓기
		MinBytes: 10e3,                 //최소 10KB 쌓이면 영상 가져와서 처리
		MaxBytes: 10e6,                 //한 번에 최대 10MB 영상 처리 가능
	})

	fmt.Println("🚀 Go media-worker 시작! 메시지를 기다리는 중...")

	for {
		m, err := reader.ReadMessage(context.Background())

		if err != nil {
			log.Fatal("메시지 읽기 실패: ", err)
			break
		}

		fmt.Println("메시지 수신:", m.Offset, string(m.Value))
	}

	if err := reader.Close(); err != nil {
		log.Fatal("리더 종료 실패:", err)
	}
}
