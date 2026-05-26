# Admin Portfolio Demo

더미데이터 + MSW(Mock Service Worker) 기반으로 만든 포트폴리오용 관리자 페이지입니다.

## Stack

- React 19
- TypeScript 6
- Vite 8
- React Router DOM v7
- TanStack Query v5
- Zustand
- Axios
- MSW v2
- TailwindCSS 3
- @uiw/react-md-editor
- Day.js
- ESLint 10
- PostCSS / Autoprefixer

## 구현 기능

- 운영 대시보드(요약 KPI, 유입 추이 차트, 채널 비중, 작업/알림)
- 회원 목록 조회 / 검색 / 상태 / 권한 필터
- 회원 상세 조회
- 회원 상태 변경(승인/정지/활성화)
- 회원 목록 CSV(엑셀) 다운로드
- 회원/공지/영상/자막 테이블 체크박스 선택 및 다중 삭제
- 공지사항 목록/상세 모달/등록/수정
- 공지사항 Markdown WYSIWYG 에디터(@uiw/react-md-editor) 기반 작성/미리보기
- 영상 목록 조회 / 상태 필터 / 상세 조회
- 영상 자막 추가/개별삭제/선택삭제
- 영상 자막 자동 추출 / 자동 번역 / 언어 단위 관리 보조 기능
- 숫자 버튼 기반 페이지네이션 공통 컴포넌트
- 다크/라이트 테마 토글
- 한국어/영어 언어 전환
- 전역 Alert/Confirm 다이얼로그(store 기반)
- 로딩 / 에러 / 빈 데이터 상태 처리

## Mock API 구조

- `src/api/*`: API 호출 함수 (dashboard/users/notices/videos)
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
