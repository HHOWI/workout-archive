# 🏋️‍♂️ Workout Archive (Monorepo)

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

**Workout Archive**는 사용자가 운동 기록을 상세하게 저장하고, 다른 사용자와 공유하며 소통할 수 있는 풀스택 웹 애플리케이션입니다. 운동 장소 기반의 소셜 네트워킹과 체계적인 통계 시각화를 통해 사용자의 운동 경험을 향상시킵니다.

---

## 📂 프로젝트 구조

본 프로젝트는 백엔드와 프론트엔드가 하나의 저장소에서 관리되는 **모노레포(Monorepo)** 구조입니다.

```text
workout-archive/
├── workout-archive-be/  # Express.js 기반 백엔드 서버
└── workout-archive-fe/  # React 기반 프론트엔드 클라이언트
```

---

## ✨ 주요 기능

- **운동 기록 관리**: 세트, 무게, 횟수 등 상세 정보 기록 및 장소 기반 저장
- **소셜 네트워킹**: 사용자 팔로우, 게시물 좋아요 및 댓글, 실시간 알림(Socket.IO)
- **통계 및 시각화**: Chart.js를 활용한 운동 볼륨 및 바디로그 추이 분석
- **장소 기반 커뮤니티**: 카카오맵 API 연동을 통한 헬스장별 운동 기록 모아보기
- **보안 및 인증**: JWT + HttpOnly 쿠키 기반 인증, bcrypt 비밀번호 암호화

---

## 🛠️ 기술 스택

| 구분 | 기술 |
| :--- | :--- |
| **Common** | `TypeScript` |
| **Backend** | `Node.js`, `Express.js`, `TypeORM`, `PostgreSQL`, `JWT`, `Socket.IO`, `Sharp`, `Zod` |
| **Frontend** | `React`, `Redux Toolkit`, `MUI (Material-UI)`, `Emotion`, `Chart.js`, `Kakao Maps API` |

---

## 🚀 시작하기

### 1. 저장소 클론
```bash
git clone https://github.com/HHOWI/workout-archive.git
cd workout-archive
```

### 2. 백엔드 설정 및 실행
```bash
cd workout-archive-be
npm install

# .env 설정 (데이터베이스 연결 정보 등)
# npm run seed (초기 데이터 및 테스트 데이터 생성)
npm run dev
```

### 3. 프론트엔드 설정 및 실행
```bash
cd ../workout-archive-fe
npm install

# .env 설정 (API URL 및 카카오맵 키)
npm start
```

---

## 📫 연락처 및 링크

- **Author**: [HHOWI](https://github.com/HHOWI)
- **Repository**: [https://github.com/HHOWI/workout-archive](https://github.com/HHOWI/workout-archive)

---

## 🙏 감사의 말

이 프로젝트는 운동을 사랑하는 모든 분들을 위해 만들어졌습니다. 감사합니다!
