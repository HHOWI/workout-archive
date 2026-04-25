# Workout Archive (Monorepo)

![GitHub language count](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![GitHub language count](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![GitHub language count](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![GitHub language count](https://img.shields.io/badge/TypeORM-FF0000?style=for-the-badge)
![GitHub language count](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![GitHub language count](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![GitHub language count](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)
![GitHub language count](https://img.shields.io/badge/MUI-0081CB?style=for-the-badge&logo=mui&logoColor=white)
![GitHub language count](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![GitHub language count](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chart.js&logoColor=white)
![GitHub language count](https://img.shields.io/badge/bcrypt-6278FF?style=for-the-badge&logo=bcrypt&logoColor=white)

## 📂 프로젝트 구조

본 프로젝트는 백엔드와 프론트엔드가 하나의 저장소에서 관리되는 **모노레포(Monorepo)** 구조입니다.

```text
workout-archive/
├── workout-archive-be/  # Express.js & PostgreSQL 기반 백엔드 서버
├── workout-archive-fe/  # React & Redux 기반 프론트엔드 클라이언트
└── screenshots/         # 리드미 에셋 (이미지, GIF)
```

---

## 📝 프로젝트 개요

**Workout Archive**는 사용자가 운동 기록을 상세하게 저장하고, 다른 사용자와 공유하며 소통할 수 있는 풀스택 웹 애플리케이션입니다. 사용자 친화적인 UI/UX와 **운동 장소 기반의 소셜 네트워킹 기능**을 결합하여 운동 경험을 향상시키고, 이를 통해 **지역 커뮤니티 활성화 또한 기대**합니다.

## ✨ 주요 기능

- **사용자 관리:**
  - JWT 기반 이메일 인증 회원가입 및 로그인 (HttpOnly 쿠키 사용)
  - bcrypt를 사용한 안전한 비밀번호 관리
  - 프로필 정보 및 이미지 관리 (본인 확인 로직 포함)
  - 사용자 팔로우/언팔로우 기능 및 목록 조회
- **운동 기록 관리:**
  - 운동 종류, 세트, 무게, 횟수, 시간, 거리 등 상세 정보 기록 (드래그 앤 드롭 순서 조정)
  - 운동 수행 장소(헬스장 등) 선택 및 기록 저장
  - 텍스트 기반 운동 일지 작성 및 사진 첨부
  - 이전 운동기록 불러오기 기능을 통해 같은 루틴의 경우 간편하게 기록
  - 소프트 삭제를 통한 데이터 복구 가능성
- **소셜 및 커뮤니티:**
  - 팔로우 기반 피드 (사용자 및 **장소** 팔로우 가능, 무한 스크롤 적용)
  - 운동 기록에 대한 댓글 및 대댓글 기능 (좋아요 포함)
  - 운동 기록 및 댓글 좋아요 기능
  - 실시간 알림 (Socket.IO 기반: 좋아요, 댓글, 팔로우 등) 및 알림 관리
  - **장소 팔로우 및 장소별 기록 모아보기를 통한 로컬 커뮤니티 기능**
- **운동 장소:**
  - 카카오맵 API 연동 장소 검색, 선택 및 기록과 함께 저장
  - 특정 장소 팔로우 기능: 관심있는 헬스장 등의 소식을 피드에서 받아볼 수 있음.
  - 장소별 운동 기록 모아보기: 특정 장소 페이지에서 해당 장소에 남겨진 다른 사용자들의 '오운완' 기록들을 확인하고, 댓글 및 좋아요 등을 통해 직접 교류하며 로컬 커뮤니티를 형성 기대.
  - 장소 상세 페이지 (지도, 정보, 통계, 관련 기록 그리드 표시)
- **통계 및 시각화:**
  - 운동 및 바디로그 데이터 기반 통계 대시보드 제공
  - Chart.js 기반 시각화 (바디로그 변화, 운동별 중량/수행능력 변화, 운동 볼륨 분석)
  - 기간 필터링 및 인터랙티브 차트 (확대/축소)
- **검색:**
  - 접두사 기반 사용자(`@닉네임`) 및 장소(`#장소명`) 검색

## 🛠️ 기술 스택

| 구분           | 기술                                                                                                                                                                   |
| :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **공통**       | `TypeScript`                                                                                                                                                           |
| **백엔드**     | `Node.js`, `Express.js`, `TypeORM` (PostgreSQL), `JWT`, `bcrypt`, `Socket.IO`, `Sharp` (이미지 처리), `Zod` (유효성 검증), `node-cron` (스케줄링), `Express Async Handler` |
| **프론트엔드** | `React`, `Redux`, `React Router`, `Emotion`, `Material-UI`, `Axios`, `React Calendar`, `Chart.js`, `React Chart.js`, `Kakao Maps API`, `Socket.IO Client`, `uuid`      |
| **개발 도구**  | `Git`, `GitHub`, `ESLint`, `Prettier`, `dotenv`                                                                                                                        |

## 📐 아키텍처 및 주요 구현 내용

### 백엔드

- **RESTful API 설계:** 자원 중심의 일관된 API 엔드포인트 설계
- **Controller-Service-Repository 패턴:** 역할 분리를 통한 코드의 모듈성 및 유지보수성 향상
  - **Controller:** HTTP 요청 처리, 데이터 유효성 검증 (Zod 활용), Service 호출, 조율
  - **Service:** 핵심 비즈니스 로직 구현 (단일 책임 원칙 준수), 트랜잭션 관리
  - **Repository:** TypeORM을 활용한 데이터베이스 접근 추상화
- **🔐 인증 및 보안**

  - JWT 기반 사용자 인증 시스템 구현
  - 로그인 시 JWT를 HttpOnly 쿠키에 저장하여 XSS 공격 방지
  - 쿠키 `sameSite`, `secure` 옵션 적용으로 CSRF 공격 위험 최소화
  - bcrypt 해싱을 통한 비밀번호 암호화
  - 미들웨어를 통한 API 접근 제어 (필수/선택적 인증) 및 리소스 소유권 검증

  ```ts
  // 쿠키에 JWT 저장 (UserController.ts)
  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: Number(process.env.MAX_COOKIE_AGE),
    path: "/",
  });
  ```

- **🖼️ 온디맨드 이미지 처리 및 캐싱:**

  - `Sharp` 라이브러리를 활용한 실시간 이미지 처리 (리사이징, 포맷 변환, 품질 조정) - URL 쿼리 파라미터(`w`, `h`, `q`, `f`) 기반
  - 변환된 이미지를 파일 시스템에 캐싱하여 반복 요청 처리 속도 향상 및 서버 부하 감소 (캐시 키: `경로-w값-h값-q값-f값`)
  - `setInterval`을 이용한 주기적인 캐시 파일 정리 (`CacheManager`, 예: 24시간)

  ```typescript
  // 이미지 처리 미들웨어 (imageProcessor.ts - 일부)
  // ... 캐시 확인 로직 ...
  // 캐시된 이미지가 없으면 처리 진행
  let pipeline = sharp(imagePath);

  // 리사이징
  if (width > 0 || height > 0) {
    pipeline = pipeline.resize(width || null, height || null, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // 포맷 변환 및 품질 적용
  switch (format) {
    case "webp":
      pipeline = pipeline.webp({ quality });
      break;
    case "png":
      pipeline = pipeline.png({ quality: quality / 100 });
      break;
    default:
      pipeline = pipeline.jpeg({ quality });
  }

  // 처리된 이미지를 캐시 파일로 저장
  await pipeline.toFile(cachePath);

  // 응답
  res.sendFile(cachePath);
  ```

- **🔔 실시간 알림 시스템 (Socket.IO):**

  - `Socket.IO`를 사용한 실시간 알림 전송 (좋아요, 댓글, 팔로우 등)
  - `SocketServerManager` (싱글톤)를 통한 웹소켓 서버 초기화 및 관리
  - 클라이언트 연결 시 JWT 기반 사용자 인증 (`authenticate` 이벤트, HttpOnly 쿠키 검증)
  - 사용자별 소켓 연결 관리 (`Map<userSeq, socket.id>`) 및 타겟 알림 전송

  ```typescript
  // 소켓 서버 설정 및 인증 (SocketServerManager.ts - 일부)
  this.io.on(SocketEvent.CONNECT, (socket: ClientSocket) => {
    socket.on(SocketEvent.AUTHENTICATE, async (data: AuthPayload) => {
      // ... 쿠키에서 JWT 토큰 추출 및 검증 ...
      const decodedToken = verifyToken(token) as JwtPayload;
      const userSeq = decodedToken.userSeq as number;
      socket.userSeq = userSeq;
      // ... userSockets 맵에 사용자 정보 저장 ...
    });
  });
  ```

- **🔒 데이터 유효성 검증 (Zod):**

  - `Zod` 라이브러리를 사용한 요청 데이터(body, query, params) 타입 및 형식 검증
  - 스키마 정의(`schema/`) 및 `ValidationUtil`을 통한 검증 로직 추상화

- **🚨 중앙 집중식 에러 핸들링:**

  - `CustomError` 클래스와 `globalErrorHandler` 미들웨어를 사용한 애플리케이션 전역 에러 처리

### 데이터베이스 설계 (ERD)

<img src="./screenshots/ERD.PNG" alt="ERD" width="1200">

### 프론트엔드

- **컴포넌트 기반 아키텍처:** 재사용 가능한 UI 컴포넌트(카드, 모달, 폼, 차트 등) 설계 및 관심사 분리
- **상태 관리:** `Redux` (전역 상태: 사용자 인증, 테마 등) 및 `React Context API` (지역적 상태) 활용
- **라우팅 및 접근 제어:** `React Router` 기반 라우팅 및 `ProtectedRoute` 관리
- **지도 연동:** `Kakao Maps API`를 활용하여 운동 장소 검색 및 지도 표시
- **📌 알림 상호작용:** 알림 클릭 시(`NotificationItem`) 타입에 따른 분기 처리 및 부드러운 스크롤 이동 기능

## 📈 개발 과정 및 배운 점

### 주요 학습 내용

- **TypeScript**의 정적 타이핑을 활용하여 코드 안정성 향상
- **TypeORM**을 이용한 객체 지향적 DB 관리 및 PostgreSQL 포팅 경험
- **React/Redux** 기반의 상태 관리 아키텍처 설계
- **Controller-Service-Repository** 패턴 적용을 통한 백엔드 모듈화
- **Socket.IO**를 활용한 실시간 웹 기능 구현 및 웹소켓 관리 경험
- **Sharp**를 이용한 효율적인 온디맨드 이미지 처리 시스템 구축

## 🔍 프로젝트 시연

### 메인 페이지
<img src="./screenshots/메인페이지.PNG" alt="메인 페이지" width="1000">

### 피드
<img src="./screenshots/피드.gif" alt="피드 기능 시연" width="900">

### 오운완 (게시글) 작성
<img src="./screenshots/오운완작성.gif" alt="오운완 기록 작성 시연" width="900">

### 주요 페이지 및 기능 시연 (프로필, 장소, 모달 등)
<img src="./screenshots/프로필,%20장소페이지,%20오운완모달,%20댓글%20등.gif" alt="주요 기능 시연" width="900">

### 실시간 알림 & 바디로그 & 통계
<p align="center">
  <img src="./screenshots/알림.gif" width="300">
  <img src="./screenshots/바디로그.gif" width="300">
  <img src="./screenshots/통계.gif" width="300">
</p>

## 💡 설치 및 실행 방법

### 백엔드 설정 (workout-archive-be)
```bash
cd workout-archive-be
npm install
# .env 설정 (DB 연결 정보 등)
npm run dev
```

### 프론트엔드 설정 (workout-archive-fe)
```bash
cd workout-archive-fe
npm install
# .env 설정
npm start
```

## 📫 연락처
- **GitHub**: [https://github.com/HHOWI](https://github.com/HHOWI)
- **Project URL**: [https://github.com/HHOWI/workout-archive](https://github.com/HHOWI/workout-archive)

---
🙏 감사합니다.
