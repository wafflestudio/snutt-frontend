import type { SnuttV2 } from '@sf/snutt-api';

// dev 서버 응답(2026-10)과 같은 모양의 가짜 데이터. 서버는 null 인 필드를 아예 보내지 않는다

export const LECTURE_RESPONSE: SnuttV2.TimetableLectureResponse = {
  id: 187337,
  lectureId: 74272,
  courseId: 9756,
  academicYear: '1학년',
  category: '수량적 분석과 추론',
  classification: '교양',
  courseNumber: '033.014',
  lectureNumber: '005',
  department: '기초교육원',
  quota: 80,
  courseTitle: '공학수학 1',
  instructor: '김명수',
  credit: 3,
  classPlaceAndTimes: [
    { day: 1, place: '043-1-301', startMinute: 660, endMinute: 735 },
    { day: 3, place: '043-1-301', startMinute: 660, endMinute: 735 },
  ],
  color: { backgroundColor: '#F58D3D', foregroundColor: '#ffffff' },
  paletteIndex: 1,
};

/** 검색 결과 (dev 서버의 2026년 1학기 응답과 같은 모양). 강의평이 없으면 avgRating 이 빠진다 */
export const SEARCH_LECTURE_RESPONSES: SnuttV2.LectureResponse[] = [
  {
    id: 183371,
    courseId: 9123,
    year: 2026,
    semester: 1,
    courseNumber: 'M3239.000200',
    lectureNumber: '001',
    courseTitle: '데이터사이언스를 위한 프로그래밍 실습',
    instructor: '김태섭',
    department: '데이터사이언스학과',
    academicYear: '석사',
    classification: '전선',
    credit: 3,
    quota: 40,
    classPlaceAndTimes: [
      { day: 4, place: '43-201', startMinute: 570, endMinute: 645 },
      { day: 4, place: '43-201', startMinute: 660, endMinute: 735 },
    ],
    evaluationSummary: { avgRating: 3, evalCount: 1 },
  },
  {
    id: 183372,
    year: 2026,
    semester: 1,
    courseNumber: 'M3239.003000',
    lectureNumber: '012',
    courseTitle: '대학원 논문연구',
    credit: 3,
    quota: 0,
    classPlaceAndTimes: [],
    evaluationSummary: { evalCount: 0 },
  },
];

/** 직접 추가한 강의: 수강편람 값이 없고, 색을 직접 골랐다 */
export const CUSTOM_LECTURE_RESPONSE: SnuttV2.TimetableLectureResponse = {
  id: 187400,
  courseTitle: '동아리 모임',
  classPlaceAndTimes: [{ day: 4, place: '', startMinute: 1140, endMinute: 1260 }],
  color: { backgroundColor: '#123456', foregroundColor: '#ffffff' },
  customColor: { backgroundColor: '#123456', foregroundColor: '#ffffff' },
  paletteIndex: 0,
};

export const TIMETABLE_RESPONSE: SnuttV2.TimetableResponse = {
  id: 68391,
  year: 2026,
  semester: 3,
  title: '나의 시간표',
  themeId: 1,
  isPrimary: true,
  updatedAt: 1783829937137,
  lectures: [LECTURE_RESPONSE, CUSTOM_LECTURE_RESPONSE],
};

export const TIMETABLE_BRIEF_RESPONSES: SnuttV2.TimetableBriefResponse[] = [
  {
    id: 68391,
    year: 2026,
    semester: 3,
    title: '나의 시간표',
    isPrimary: true,
    updatedAt: 1783829937137,
    totalCredit: 3,
  },
  { id: 68392, year: 2026, semester: 3, title: '시간표 2', isPrimary: false, updatedAt: 1783829900000, totalCredit: 0 },
];

export const THEME_RESPONSE: SnuttV2.ThemeResponse = {
  id: 1,
  name: 'SNUTT',
  colors: [
    { backgroundColor: '#E54459', foregroundColor: '#ffffff' },
    { backgroundColor: '#F58D3D', foregroundColor: '#ffffff' },
  ],
  kind: 'BUILTIN',
  builtinCode: 'snutt',
  isDefault: false,
};

export const TOKEN_RESPONSE: SnuttV2.TokenResponse = {
  userId: 1,
  accessToken: 'test-access-token',
  refreshToken: 'test-refresh-token',
};

/** 친구 목록 (dev 서버 응답과 같은 모양). 내가 이름을 붙이지 않은 친구는 displayName 이 빠진다 */
export const FRIEND_RESPONSES: SnuttV2.FriendResponse[] = [
  { id: 10, userId: 79615, nickname: '와플', nicknameTag: '7052', createdAt: 1693807592108 },
  { id: 4, userId: 59465, displayName: '룸메', nickname: '시간표장인', nicknameTag: '0562', createdAt: 1692246423442 },
];

/** v2 에러 응답 (RFC 7807) */
export const problem = (status: number, type: string, title: string, detail: string) => ({
  type: `/problems/${type}`,
  title,
  status,
  detail,
  instance: '/v2/test',
});
