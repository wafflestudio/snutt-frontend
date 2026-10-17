import { describe, expect, it } from 'vitest';
import {
  toCustomLectureRequest,
  toLecture,
  toLectureModifyRequest,
  toTheme,
  toTimetable,
  toTimetableSummary,
} from '@/api/mappers/timetable';
import {
  SEARCH_LECTURE_RESPONSES,
  TIMETABLE_BRIEF_RESPONSES,
  TIMETABLE_RESPONSE,
  THEME_RESPONSE,
} from '../../msw/fixtures';

describe('timetable mapper', () => {
  it('시간표: ID 는 문자열, semester 는 term, updatedAt 은 Date', () => {
    const timetable = toTimetable(TIMETABLE_RESPONSE);
    expect(timetable).toMatchObject({
      id: '68391',
      title: '나의 시간표',
      semester: { year: 2026, term: 3 },
      themeId: '1',
      isPrimary: true,
      updatedAt: new Date(1783829937137),
    });
  });

  it('수강편람 강의: 빠진 필드는 null, 색은 팔레트 번호 (0부터)', () => {
    const [lecture] = toTimetable(TIMETABLE_RESPONSE).lectures;
    expect(lecture).toEqual({
      id: '187337',
      lectureId: '74272',
      courseId: '9756',
      title: '공학수학 1',
      instructor: '김명수',
      remark: null,
      classTimes: [
        { day: 1, startMinute: 660, endMinute: 735, place: '043-1-301' },
        { day: 3, startMinute: 660, endMinute: 735, place: '043-1-301' },
      ],
      department: '기초교육원',
      academicYear: '1학년',
      category: '수량적 분석과 추론',
      categoryPre2025: null,
      classification: '교양',
      quota: 80,
      freshmanQuota: null,
      credit: 3,
      courseNumber: '033.014',
      lectureNumber: '005',
      color: { type: 'palette', index: 1 },
    });
  });

  it('검색 결과: 학기와 강의평 요약을 담고, 빠진 필드는 null', () => {
    const [rated, unrated] = SEARCH_LECTURE_RESPONSES.map(toLecture);
    expect(rated).toEqual({
      id: '183371',
      semester: { year: 2026, term: 1 },
      courseId: '9123',
      title: '데이터사이언스를 위한 프로그래밍 실습',
      instructor: '김태섭',
      remark: null,
      classTimes: [
        { day: 4, startMinute: 570, endMinute: 645, place: '43-201' },
        { day: 4, startMinute: 660, endMinute: 735, place: '43-201' },
      ],
      department: '데이터사이언스학과',
      academicYear: '석사',
      category: null,
      categoryPre2025: null,
      classification: '전선',
      quota: 40,
      freshmanQuota: null,
      credit: 3,
      courseNumber: 'M3239.000200',
      lectureNumber: '001',
      evaluation: { rating: 3, count: 1 },
    });
    expect(unrated).toMatchObject({
      courseId: null,
      instructor: null,
      classTimes: [],
      evaluation: { rating: null, count: 0 },
    });
  });

  it('직접 추가한 강의: lectureId 는 null, 직접 고른 색, 빈 장소는 null', () => {
    const [, custom] = toTimetable(TIMETABLE_RESPONSE).lectures;
    expect(custom).toMatchObject({
      id: '187400',
      lectureId: null,
      courseId: null,
      credit: null,
      courseNumber: null,
      color: { type: 'custom', color: { bg: '#123456', fg: '#ffffff' } },
      classTimes: [{ day: 4, startMinute: 1140, endMinute: 1260, place: null }],
    });
  });

  it('시간표 목록', () => {
    expect(TIMETABLE_BRIEF_RESPONSES.map(toTimetableSummary)).toEqual([
      {
        id: '68391',
        title: '나의 시간표',
        semester: { year: 2026, term: 3 },
        totalCredit: 3,
        isPrimary: true,
        updatedAt: new Date(1783829937137),
      },
      {
        id: '68392',
        title: '시간표 2',
        semester: { year: 2026, term: 3 },
        totalCredit: 0,
        isPrimary: false,
        updatedAt: new Date(1783829900000),
      },
    ]);
  });

  it('테마: 색은 bg / fg 쌍', () => {
    expect(toTheme(THEME_RESPONSE)).toEqual({
      id: '1',
      name: 'SNUTT',
      colors: [
        { bg: '#E54459', fg: '#ffffff' },
        { bg: '#F58D3D', fg: '#ffffff' },
      ],
    });
  });
});

describe('요청 mapper', () => {
  it('직접 추가: 빈 장소는 빈 문자열, 팔레트 색은 paletteIndex, 시간이 겹치면 서버가 거절한다', () => {
    expect(
      toCustomLectureRequest({
        title: '스터디',
        instructor: null,
        credit: 2,
        remark: null,
        classTimes: [{ day: 5, startMinute: 600, endMinute: 660, place: null }],
        color: { type: 'palette', index: 3 },
      }),
    ).toEqual({
      courseTitle: '스터디',
      instructor: null,
      credit: 2,
      remark: null,
      classPlaceAndTimes: [{ day: 5, startMinute: 600, endMinute: 660, place: '' }],
      paletteIndex: 3,
      customColor: null,
      isForced: false,
    });
  });

  it('강의 수정: 바뀐 필드만 보내고, 지운 값은 resetFields 로 보낸다 (null 은 "바꾸지 않음")', () => {
    expect(toLectureModifyRequest({ color: { type: 'custom', color: { bg: '#123456', fg: '#ffffff' } } })).toEqual({
      paletteIndex: null,
      customColor: { backgroundColor: '#123456', foregroundColor: '#ffffff' },
      resetFields: [],
      isForced: false,
    });
    expect(toLectureModifyRequest({ title: '새 이름', instructor: null, credit: 2, remark: null })).toEqual({
      courseTitle: '새 이름',
      credit: 2,
      resetFields: ['instructor', 'remark'],
      isForced: false,
    });
  });
});
