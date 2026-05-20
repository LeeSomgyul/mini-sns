package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"sync"
	"syscall"

	"github.com/joho/godotenv"
	"github.com/segmentio/kafka-go"

	"media-worker/messaging"
	"media-worker/models"
	"media-worker/processor"
	"media-worker/service"
	"media-worker/storage"
)

func main() {
	brokers := []string{"localhost:9094"}

	//[1단계] env 파일 로드
	err := godotenv.Load()
	if err != nil {
		log.Fatal(".env 파일을 찾을 수 없습니다.")
	}

	//[2단계] 인프라 준비
	//2-1. MiniO 연결 준비
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

	//2-2. Kafka 메시지 수신 준비
	kafkaConsumer, err := messaging.NewKafkaConsumer(
		brokers,
		"media.video.requested",
		"mini-sns-media-worker",
	)
	if err != nil {
		log.Fatalln("Kafka 메시지 수신 실패: ", err)
	}

	defer kafkaConsumer.Reader.Close() // 수신기 닫기 예약

	//2-3. Kafka 메시지 발신 준비
	kafkaProducer, err := messaging.NewKafkaProducer(
		brokers,
		"media.video.completed",
	)
	if err != nil {
		log.Fatalln("Kafka 메시지 발신 실패: ", err)
	}

	defer kafkaProducer.Writer.Close() // 발신기 닫기 예약

	//2-4. FFmpeg 준비
	videoProcessor := processor.NewVideoProcessor()

	//[4단계] 비디오 처리 과정 준비
	videoService := service.NewVideoService(
		minioService,
		videoProcessor,
		kafkaProducer,
	)

	//[5단계] 안전한 종료
	var wg sync.WaitGroup
	ctx, cancel := context.WithCancel(context.Background())

	sigChan := make(chan os.Signal, 1)                      //Ctrl + C 신호 감지
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGALRM) //종료 명령이 들어오면 sigChan에게 알리기

	// 5-1.종료 신호가 오는지 계속 감시
	go func() {
		sig := <-sigChan //종료 신호가 들어오면 sig에 저장
		fmt.Printf("\n🛑 종료 신호 감지 (%v)! 종료를 시작합니다...\n", sig)
		cancel() //새 신호 받기 정지
	}()

	fmt.Println("🚀 Go media-worker 시작! 메시지를 기다리는 중...")

	for {
		m, err := kafkaConsumer.GetMessage(ctx)
		if err != nil {
			if ctx.Err() != nil {
				fmt.Println("🔒 Kafka 메시지 수신을 정지합니다.")
			} else {
				log.Println("❌ 메시지 읽기 실패: ", err)
			}
			break
		}

		//형식 변환: 카프카가 전달해주는 JSON 메시지 -> GO가 읽을 수 있는 형식으로 변환
		//m.Value: JSON 형식의 데이터
		//&event: 데이터가 담길 메모리 주소
		var event models.MediaProcessEvent
		json.Unmarshal(m.Value, &event)

		//작업 폴더에 새로운 작업 추가
		wg.Add(1)

		//비동기 처리 (비디오 처리하는 동안 다른 카프카 메시지 받기 가능)
		go func(msg kafka.Message, e models.MediaProcessEvent) {
			defer wg.Done()

			//1. 영상 가공 처리 시도
			err := videoService.ProcessPostVideo(event.VideoKey, event.PostID)

			if err == nil {
				commitErr := kafkaConsumer.CommitMessage(context.Background(), msg)

				if commitErr != nil {
					log.Printf("⚠️ Kafka 커밋 실패: %v\n", commitErr)
				} else {
					fmt.Printf("✅ [post_%d] Kafka 커밋 완료!\n", e.PostID)
				}
			} else {
				log.Printf("🚨 [post_%d] 작업 실패! Kafka 커밋을 보류합니다. (재시도 대기)\n", e.PostID)
			}
		}(m, event)
	}

	// 5-2.남은 작업 마무리 대기
	fmt.Println("⏳ 현재 진행 중인 작업이 완료될 때까지 기다립니다...")
	wg.Wait() //대기중인 작업이 완료될때까지 종료 대기

	fmt.Println("🎉 모든 작업이 안전하게 저장되었습니다. 서버를 종료합니다.")
}
