# Admin Portfolio Demo

더미데이터 + MSW(Mock Service Worker) 기반으로 만든 포트폴리오용 관리자 페이지입니다.

## Stack

- React 19
- TypeScript
- Vite
- React Router DOM v7
- TanStack Query v5
- Zustand
- Axios
- MSW v2
- TailwindCSS 3

## 구현 기능

- 대시보드 요약 지표 조회
- 회원 목록 조회 / 검색 / 상태 / 권한 필터
- 회원 상세 조회
- 회원 상태 변경(승인/정지/활성화)
- 숫자 버튼 기반 페이지네이션
- 다크/라이트 테마 토글
- 한국어/영어 언어 전환
- 로딩 / 에러 / 빈 데이터 상태 처리

## Mock API 구조

- `src/api/*`: API 호출 함수
- `src/mocks/handlers.ts`: API 엔드포인트 mock 핸들러
- `src/data/users.ts`: 더미 데이터 원천
- `public/mockServiceWorker.js`: MSW 서비스워커

## 실행

```bash
yarn dev
```

개발 모드에서만 MSW가 활성화되며, 실제 API 없이도 `/api/*` 요청이 정상 동작합니다.

## 포트폴리오 설명 예시

실제 백엔드 없이 MSW 기반 mock API를 구성하여 회원 목록 조회, 검색, 필터, 상세 조회, 상태 변경 플로우를 구현했습니다. API 요청/응답 계층을 분리해 추후 실제 서버 API로 전환하기 쉽도록 설계했습니다.
