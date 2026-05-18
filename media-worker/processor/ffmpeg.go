package processor

import (
	"fmt"
	"os/exec"
	"path/filepath"
)

type VideoProcessor struct {
}

func NewVideoProcessor() *VideoProcessor {
	return &VideoProcessor{}
}

// [720p, 1080p 해상도 변경]
// tempDir: 작업대상 영상이 담겨있는 폴더 위치
// map[string]string: ["720" or "1080"] "파일 저장 위치"
func (p *VideoProcessor) ResolutionVideos(tempDir string) (map[string]string, error) {
	inputPath := filepath.Join(tempDir, "original_video.mp4") //작업 대상 원본 영상
	videoPaths := make(map[string]string)                     //720p, 1080p 결과 ([키]값 형식)
	resolutions := []int{720, 1080}

	//720p, 1080p 해상도로 각각 영상 제작
	for _, resolution := range resolutions {
		//해상도 변경된 최종 결과물
		outputPath := filepath.Join(tempDir, fmt.Sprintf("processed_%d.mp4", resolution))

		//[bg]: 흐리게 만든 배경
		//[main]: 배경 위에 올라갈 원본 영상
		filter := fmt.Sprintf(
			"[0:v]scale=%d:%d:force_original_aspect_ratio=increase,crop=%d:%d,boxblur=20:10[bg];"+
				"[0:v]scale=%d:%d:force_original_aspect_ratio=decrease[fg];"+
				"[bg][fg]overlay=(W-w)/2:(H-h)/2",
			resolution, resolution, resolution, resolution, resolution, resolution,
		)

		//ffmpeg 실행
		cmd := exec.Command(
			"ffmpeg",        //프로그램 이름
			"-i", inputPath, //작업 대상 영상
			"-lavfi", filter, //필터 적용
			"-c:v", "libx264", //영상 압축
			"-crf", "23", //화질
			"-preset", "veryfast", //압축 속도 높이기
			"-y",       //동일한 파일명 있으면 덮어쓰기
			outputPath, //결과물 저장 경로
		)

		fmt.Printf("🎬 %dp 영상 가공 중...\n", resolution)

		err := cmd.Run()
		if err != nil {
			return nil, fmt.Errorf("❌ %dp 영상 처리 실패: %v", resolution, err)
		}

		videoPaths[fmt.Sprintf("%dp", resolution)] = outputPath
	}

	return videoPaths, nil
}

// [썸네일 추출]
// tempDir: 작업대상 영상이 담겨있는 폴더 위치
func (p *VideoProcessor) ExtractThumbnail(tempDir string) (string, error) {
	inputPath := filepath.Join(tempDir, "original_video.mp4") //작업 대상 원본 영상
	thumbPath := filepath.Join(tempDir, "thumbnail.jpg")      //썸네일 결과물 저장 위치

	//720p 크기의 1:1 블러처리
	filter := "[0:v]scale=720:720:force_original_aspect_ratio=increase,crop=720:720,boxblur=20:10[bg];" +
		"[0:v]scale=720:720:force_original_aspect_ratio=decrease[fg];" +
		"[bg][fg]overlay=(W-w)/2:(H-h)/2"

	//썸네일 제작
	cmd := exec.Command(
		"ffmpeg",          //프로그램 이름
		"-ss", "00:00:01", //1초 지점 캡쳐
		"-i", inputPath, //작업 대상 영상
		"-lavfi", filter, //필터 적용
		"-vframes", "1", //1장만 캡처
		"-y",      //동일한 파일명 있으면 덮어쓰기
		thumbPath, //결과물 저장 경로
	)

	fmt.Println("📸 원본에서 썸네일 추출 중...")

	err := cmd.Run()
	if err != nil {
		return "", fmt.Errorf("❌ 썸네일 추출 실패: %v", err)
	}

	return thumbPath, nil
}
