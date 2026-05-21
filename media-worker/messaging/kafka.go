package messaging

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"media-worker/models"

	"github.com/segmentio/kafka-go"
)

type KafkaConsumer struct {
	Reader *kafka.Reader
}

type KafkaProducer struct {
	Writer *kafka.Writer
}

// [카프카 메시지 수신]
func NewKafkaConsumer(brokers []string, topic, groupID string) (*KafkaConsumer, error) {
	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers:     brokers,           //도커 내부의 카프카랑 연결하기 위한 포트 번호
		Topic:       topic,             //메시지 저장 위치
		GroupID:     groupID,           //나중에 영상 요청이 많아질때를 대비해서, 워커에게 동일한 이름 짓기
		MinBytes:    10e3,              //최소 10KB 쌓이면 영상 가져와서 처리
		MaxBytes:    10e6,              //한 번에 최대 10MB 영상 처리 가능
		StartOffset: kafka.FirstOffset, //Go가 꺼져있더라도 카프카가 기억하고 나중에 메시지 다 가져오기
	})

	return &KafkaConsumer{Reader: reader}, nil
}

// [카프카가 저장하고 있는 메시지 1개 가져오기]
func (kc *KafkaConsumer) GetMessage(ctx context.Context) (kafka.Message, error) {
	return kc.Reader.FetchMessage(ctx)
}

// [영상 처리 완료 응답]
func (kc *KafkaConsumer) CommitMessage(ctx context.Context, msg kafka.Message) error {
	return kc.Reader.CommitMessages(ctx, msg)
}

// [카프카 연결 닫기]
func (kc *KafkaConsumer) Close() error {
	return kc.Reader.Close()
}

// [카프카 메시지 발신 준비]
func NewKafkaProducer(brokers []string, topic string) (*KafkaProducer, error) {
	writer := &kafka.Writer{
		Addr:     kafka.TCP(brokers...),
		Topic:    topic,
		Balancer: &kafka.LeastBytes{},
	}

	return &KafkaProducer{Writer: writer}, nil
}

// [카프카 메시지 발신]
func (kp *KafkaProducer) SendCompleteEvent(ctx context.Context, event models.VideoCompleteEvent) error {
	result, err := json.Marshal(event)
	if err != nil {
		log.Printf("❌ 메시지 발신 실패: %v", err)
		return err
	}

	key := fmt.Sprintf("%d", event.PostId)

	return kp.Writer.WriteMessages(ctx, kafka.Message{
		Key:   []byte(key),
		Value: result,
	})
}
