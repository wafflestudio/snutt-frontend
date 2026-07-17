# SNUTT 시간표 가져오기 (Timetable Picker)

외부 웹사이트에서 SNUTT을 팝업으로 열어, 사용자가 자신의 시간표 하나를 선택하면 그 시간표 데이터를 `postMessage`로 돌려받는 기능입니다.

## 흐름

1. 외부 사이트가 SNUTT을 **팝업 창**으로 연다 (`?origin=<내 사이트 origin>` 포함).
2. 사용자가 팝업 안에서 로그인한다.
3. 사용자가 학기별 시간표 목록에서 하나를 골라 **확인**을 누른다.
4. SNUTT이 선택된 시간표를 `window.opener.postMessage(...)`로 전달하고 팝업을 닫는다.
5. 외부 사이트는 `message` 이벤트로 시간표 데이터를 수신한다.

## 사전 준비: origin 등록

보안을 위해 **미리 등록된 origin에게만** 시간표를 전달합니다. 연동하려는 사이트의 origin(`scheme://host[:port]`)을 SNUTT 팀에 전달해 허용 목록에 등록해야 합니다.

- `https://example.com` ✅
- `https://example.com/` ❌ (뒤 슬래시 X)
- `example.com` ❌ (scheme 필수)
- 표준 포트가 아니면 포함해야 함: `https://example.com:8443`
- 서브도메인·`www.` 유무·대소문자까지 정확히 일치해야 합니다.

등록되지 않은 origin으로 열면 팝업은 "허용되지 않은 요청입니다" 에러 화면만 보여주고 아무 데이터도 전달하지 않습니다.

## 1. 팝업 열기

```js
const SNUTT_URL = 'https://<SNUTT-웹주소>/timetable-picker';
const myOrigin = window.location.origin; // 예: https://example.com

const popup = window.open(
  `${SNUTT_URL}?origin=${encodeURIComponent(myOrigin)}`,
  'snutt-timetable-picker',
  'width=1000,height=800',
);
```

- `origin` 쿼리 파라미터에는 **본인 사이트의 origin**을 넣습니다. 이 값은 위 허용 목록에 등록된 값과 정확히 일치해야 하고, SNUTT은 이 origin으로만 결과를 `postMessage` 합니다.
- 팝업 방식이어야 합니다(`window.open`). SNUTT은 자신을 연 창(`window.opener`)에게 결과를 보냅니다. iframe 임베드는 지원하지 않습니다.

## 2. 결과 수신

```js
window.addEventListener('message', (event) => {
  // 1) origin 검증 — 반드시 SNUTT의 origin인지 확인
  if (event.origin !== 'https://<SNUTT-웹주소>') return;

  // 2) 메시지 타입 검증
  if (event.data?.type !== 'SNUTT_TIMETABLE_SELECTED') return;

  const timetable = event.data.payload;
  console.log('선택된 시간표:', timetable);
  // ... 원하는 처리
});
```

> **보안 주의:** 수신 측에서 `event.origin`을 **반드시** 검사하세요. 다른 창/확장 프로그램도 페이지로 `message`를 보낼 수 있습니다. 신뢰할 수 있는 SNUTT origin이 아니면 무시해야 합니다.

## 메시지 포맷

```ts
{
  type: 'SNUTT_TIMETABLE_SELECTED',
  payload: FullTimetable
}
```

### `FullTimetable`

| 필드 | 타입 | 설명 |
|---|---|---|
| `_id` | `string` | 시간표 ID |
| `title` | `string` | 시간표 이름 |
| `year` | `number` | 연도 (예: 2026) |
| `semester` | `1 \| 2 \| 3 \| 4` | 학기 (1=봄, 2=여름, 3=가을, 4=겨울) |
| `lecture_list` | `Lecture[]` | 강의 목록 (아래 참고) |
| `theme` | `number` | 시간표 색 테마 인덱스 |
| `user_id` | `string` | 소유자 ID |
| `updated_at` | `string` | 마지막 수정 시각 (ISO 문자열) |

### `Lecture` (주요 필드)

| 필드 | 타입 | 설명 |
|---|---|---|
| `_id` | `string` | 강의 ID |
| `course_title` | `string` | 강의명 |
| `instructor` | `string?` | 교수명 |
| `credit` | `number?` | 학점 |
| `class_time_json` | `ClassTime[]` | 수업 시간·장소 목록 |
| `department` | `string?` | 학과 |
| `course_number` | `string?` | 교과목 번호 |
| `lecture_number` | `string?` | 강좌 번호 |
| `remark` | `string?` | 비고 |
| `colorIndex` | `0 \| 1 \| … \| 9` | 색상 인덱스 |
| `color` | `{ fg?, bg? }` | `colorIndex`가 0(커스텀)일 때의 색 |

### `ClassTime`

| 필드 | 타입 | 설명 |
|---|---|---|
| `day` | `0 \| 1 \| … \| 6` | 요일 (0=월, 1=화, 2=수, 3=목, 4=금, 5=토, 6=일) |
| `startMinute` | `number` | 시작 시각 (자정 기준 분, 예: 09:00 → 540) |
| `endMinute` | `number` | 종료 시각 (분) |
| `place` | `string?` | 강의실 |

### 예시 payload

```json
{
  "type": "SNUTT_TIMETABLE_SELECTED",
  "payload": {
    "_id": "665f...",
    "title": "2026-1 시간표",
    "year": 2026,
    "semester": 1,
    "theme": 0,
    "user_id": "abcd...",
    "updated_at": "2026-07-01T05:00:00.000Z",
    "lecture_list": [
      {
        "_id": "770a...",
        "course_title": "컴퓨터프로그래밍",
        "instructor": "홍길동",
        "credit": 3,
        "colorIndex": 1,
        "color": {},
        "class_time_json": [
          { "day": 0, "startMinute": 540, "endMinute": 630, "place": "301-101" },
          { "day": 2, "startMinute": 540, "endMinute": 630, "place": "301-101" }
        ]
      }
    ]
  }
}
```

## 예외 / 엣지 케이스

- **등록되지 않은 origin으로 접근**: 팝업이 에러 화면만 표시하고 데이터를 보내지 않습니다.
- **`origin` 파라미터 누락**: 위와 동일하게 차단됩니다.
- **사용자가 그냥 팝업을 닫음**: 아무 메시지도 오지 않습니다. 수신 측에서 팝업 종료를 감지하려면 `popup.closed`를 폴링하거나 타임아웃을 두세요.
- **여러 SNUTT 창을 동시에 열지 마세요**: 어느 창에서 온 메시지인지 구분이 어렵습니다.

## 전체 예시

```js
function pickSnuttTimetable() {
  const SNUTT_ORIGIN = 'https://<SNUTT-웹주소>';
  const myOrigin = window.location.origin;

  const popup = window.open(
    `${SNUTT_ORIGIN}/timetable-picker?origin=${encodeURIComponent(myOrigin)}`,
    'snutt-timetable-picker',
    'width=1000,height=800',
  );

  return new Promise((resolve, reject) => {
    const onMessage = (event) => {
      if (event.origin !== SNUTT_ORIGIN) return;
      if (event.data?.type !== 'SNUTT_TIMETABLE_SELECTED') return;
      cleanup();
      resolve(event.data.payload);
    };

    // 사용자가 그냥 닫은 경우 감지
    const timer = setInterval(() => {
      if (popup?.closed) {
        cleanup();
        reject(new Error('팝업이 닫혔습니다'));
      }
    }, 500);

    const cleanup = () => {
      window.removeEventListener('message', onMessage);
      clearInterval(timer);
    };

    window.addEventListener('message', onMessage);
  });
}

// 사용
pickSnuttTimetable()
  .then((timetable) => console.log('가져온 시간표:', timetable))
  .catch((err) => console.warn(err.message));
```

---

문의: WaffleStudio SNUTT 팀
