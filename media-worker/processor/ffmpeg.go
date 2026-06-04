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

	//쪼갠 파일
	masterPath := filepath.Join(tempDir, "master.m3u8")
	m3u8Path := filepath.Join(tempDir, "stream_%v.m3u8")
	tsPath := filepath.Join(tempDir, "stream_%v_%03d.ts")

	//배경 흐리게 하고 위에 영상 올리기
	multiFilter := "[0:v]split=2[raw1][raw2]; " +
		// 720p
		"[raw1]split=2[bg1][fg1]; " +
		"[bg1]scale=720:720:force_original_aspect_ratio=increase,crop=720:720,boxblur=20:10[bg1out]; " +
		"[fg1]scale=720:720:force_original_aspect_ratio=decrease[fg1out]; " +
		"[bg1out][fg1out]overlay=(W-w)/2:(H-h)/2[v1out]; " +
		// 1080p
		"[raw2]split=2[bg2][fg2]; " +
		"[bg2]scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080,boxblur=20:10[bg2out]; " +
		"[fg2]scale=1080:1080:force_original_aspect_ratio=decrease[fg2out]; " +
		"[bg2out][fg2out]overlay=(W-w)/2:(H-h)/2[v2out]"

	//ffmpeg 명령문
	cmd := exec.Command(
		"ffmpeg",        //프로그램 이름
		"-autorotate",   //영상 회전 정보 자동 적용
		"-i", inputPath, //작업 대상 영상
		"-t", "60", //60초 이후 자르기

		//하나의 원본 파일을 복사해서 720p, 1080p 처리하여 분리 출력
		"-filter_complex", multiFilter,

		//720p (stream_0) 인코딩 설정
		"-map", "[v1out]",
		"-c:v:0", "libx264",
		"-crf:v:0", "23",
		"-maxrate:v:0", "2500k",
		"-bufsize:v:0", "5000k",

		//1080p (stream_1) 인코딩 설정
		"-map", "[v2out]",
		"-c:v:1", "libx264",
		"-crf:v:1", "23",
		"-maxrate:v:1", "5000k",
		"-bufsize:v:1", "10000k",

		"-preset", "veryfast",
		"-f", "hls",
		"-hls_time", "3", //3초 단위로 쪼개기
		"-hls_playlist_type", "vod", //조각 다시보기 지원(영상 뒤로가기 볼때 조각을 기억)

		"-var_stream_map", "v:0 v:1", //720p와 1080p를 분리
		"-master_pl_name", "master.m3u8", //둘을 묶는 master.m3u8 제작

		"-hls_segment_filename", tsPath, //조각 저장
		"-y",     //동일한 파일명 있으면 덮어쓰기
		m3u8Path, //최종 조각 세트 정보 저장
	)

	fmt.Println("🎬 720p & 1080p 멀티 비트레이트 통합 영상 가공 중...")

	//FFmpeg 실행
	err := cmd.Run()
	if err != nil {
		return nil, fmt.Errorf("❌ 720p & 1080p 멀티 비트레이트 영상 처리 실패: %v", err)
	}

	videoPaths["master"] = masterPath

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
