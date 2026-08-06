# === 1단계: 빌드 ===

# 빌드용 베이스 이미지 선택
FROM golang:1.26-alpine AS build

# 도커 내부 가상 폴더 /app 생성
WORKDIR /app

# 필요한 유틸리티 설치
COPY go.mod go.sum ./
RUN go mod download

# 그래들 빌드에 backend 폴더 전체를 /app 경로로 복사
COPY . .

# 실행 파일 빌드
RUN go build -o worker main.go


# === 2단계: 실행 ===
FROM alpine:latest

WORKDIR /app

# ffmpeg 설치 (Alpine 패키지 저장소 이용)
RUN apk add --no-cache ffmpeg

COPY --from=build /app/worker .


# go워커 명령어 자동 실행
ENTRYPOINT ["./worker"]
