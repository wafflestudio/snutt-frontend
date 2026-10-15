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

/** v2 에러 응답 (RFC 7807) */
export const problem = (status: number, type: string, title: string, detail: string) => ({
  type: `/problems/${type}`,
  title,
  status,
  detail,
  instance: '/v2/test',
});
