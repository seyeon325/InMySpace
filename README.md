# InMySpace · 인마이스페이스

수면, 마음 건강, 루틴을 한곳에서 관리하는 웹앱입니다. Figma 디자인을 Next.js로 옮겼습니다.

## 화면

| 경로 | 이름 | 내용 |
|---|---|---|
| `/` | 조종실 | 오늘의 요약, 데일리 오비트, 마이 스페이스 룸, 궤도 시그널 |
| `/orbit` | 궤도 관리실 | 주간 플래너, 할 일, 루틴, 밀린 할 일, 집중 타이머와 메모 |
| `/mind` | 마음 정류장 | 감정 일기 캘린더, 감정 온도계, 블랙홀, 감정 보틀, 마음 운동 |
| `/dream` | 꿈 기록실 | 수면 요약과 점수, 꿈 메모, 하루 기록, 수면 단계, 슬립 테라피 |
| `/my-space` | 마이 스페이스 | 정신 건강 육각형, 통계, 배지, 나노미 |

## 기술 스택

Next.js (App Router) · React · TypeScript · Tailwind CSS v4 · zustand

데이터는 브라우저 localStorage에 저장됩니다(키 `inmyspace`). 서버나 로그인은 아직 없습니다.

## 실행

```bash
npm install
npm run assets   # Figma 이미지를 public/figma 로 내려받기 (최초 1회)
npm run dev      # http://localhost:3000
```

`npm run assets`는 `scripts/figma-assets.json`에 적힌 Figma 이미지 주소에서 파일을 받습니다. 이 주소는 발급 후 약 7일 동안만 유효합니다. 이미지가 `public/figma`에 커밋된 뒤에는 이 단계가 필요 없습니다.

## 폴더

- `src/app` 각 화면
- `src/components` 공통 UI (내비게이션, 카드, 모달 등)
- `src/lib/store.ts` 상태와 점수 계산
- `src/lib/assets.ts` Figma 이미지 목록
