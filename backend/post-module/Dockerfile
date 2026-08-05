# === 1단계: 빌드 (자바 코드를 .jar로 생성)===

# 빌드용 베이스 이미지 선택 (Amazon Corretto Java 21)
FROM amazoncorretto:21 AS build

# 도커 내부 가상 폴더 /app 생성
WORKDIR /app

# 필요한 유틸리티 설치
RUN yum install -y findutils && yum clean all

# 그래들 빌드에 backend 폴더 전체를 /app 경로로 복사
COPY . .

# gradlew 실행 파일에 실행 권한(+x) 부여
# - 리눅스 환경에서는 권한이 없으면 gradlew 파일이 실행되지 않을 수 있기 때문
RUN chmod +x gradlew

# post 모듈만 선택해서 빌드 실행
# -'-x test' 옵션 추가하여 테스트 코드 실행은 건너뛰기
RUN ./gradlew :post-module:bootJar -x test


# === 2단계: 실행 (.jar 파일 실행)===
FROM amazoncorretto:21-alpine

WORKDIR /app

# 1단계에서 생성된 .jar 파일만 가져와서, /app/app 경로로 복사
COPY --from=build /app/post-module/build/libs/post-module.jar app.jar

EXPOSE 8082

# 스프링 부트 서버 명령어 자동 입력 (java -jar app.jar)
ENTRYPOINT ["java", "-jar", "app.jar"]
