# Admin Portfolio Demo

더미데이터 + MSW(Mock Service Worker) 기반으로 만든 포트폴리오용 관리자 페이지입니다.

## Stack

- React 19
- TypeScript 6
- Vite 8
- React Router DOM 7
- TanStack Query 5
- Zustand 5
- Axios 1
- MSW 2
- Tailwind CSS 3
- i18next / react-i18next
- @uiw/react-md-editor
- react-multi-date-picker
- Day.js

## 구현 기능

- 운영 대시보드 (KPI/추이/비중/작업/알림)
- 회원 관리 (검색, 필터 모달, 상태 변경, 엑셀 다운로드, 다중 선택 삭제)
- 공지사항 관리 (목록, 상세 모달, 등록/수정, Markdown 에디터)
- 설문 관리 (목록, 등록/수정 페이지, 문항 타입/OX/선형배율/점수)
- 영상 관리 (목록, 상세, 자막 언어/타임라인 관리)
- 실시간 관리 목록 페이지
- 공통 테이블 체크박스 선택/일괄 삭제
- 공통 페이지네이션, 스켈레톤 로딩, 에러/빈 상태 UI
- 다크/라이트 테마 + 한국어/영어 전환 (저장 유지)
- Alert/Confirm 다이얼로그 전역 처리
- `react-multi-date-picker` 기반 기간 선택 UI

## Mock API 구조

- `src/api/*`: API 호출 함수 (dashboard/users/notices/surveys/videos)
- `src/mocks/handlers.ts`: API 엔드포인트 mock 핸들러
- `src/data/users.ts`, `src/data/admin.ts`: 더미 데이터 원천
- `public/mockServiceWorker.js`: MSW 서비스워커

## 실행

```bash
yarn dev
```

개발 모드에서만 MSW가 활성화되며, 실제 API 없이도 `/api/*` 요청이 정상 동작합니다.

## 포트폴리오 설명 예시

실제 백엔드 없이 MSW 기반 mock API를 구성하여 회원 목록 조회, 검색, 필터, 상세 조회, 상태 변경 플로우를 구현했습니다. API 요청/응답 계층을 분리해 추후 실제 서버 API로 전환하기 쉽도록 설계했습니다.
