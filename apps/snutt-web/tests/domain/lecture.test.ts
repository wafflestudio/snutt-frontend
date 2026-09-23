import { describe, expect, it } from 'vitest';

import { getClassTimeTexts, getSyllabusUrl } from '@/domain/lecture';

describe('getClassTimeTexts', () => {
  it('요일, 시작 시각 순으로 정렬해 표시한다', () => {
    const classTimes = [
      { day: 2, startMinute: 600, endMinute: 675, place: '301-101' },
      { day: 0, startMinute: 600, endMinute: 675, place: '301-101' },
    ] as const;
    expect(getClassTimeTexts({ classTimes: [...classTimes] })).toEqual(['월 10:00~11:15', '수 10:00~11:15']);
  });

  it('원본 배열의 순서는 바꾸지 않는다', () => {
    const classTimes = [
      { day: 2 as const, startMinute: 600, endMinute: 675, place: null },
      { day: 0 as const, startMinute: 600, endMinute: 675, place: null },
    ];
    getClassTimeTexts({ classTimes });
    expect(classTimes[0].day).toBe(2);
  });
});

describe('getSyllabusUrl', () => {
  it('학기에 맞는 수강신청 사이트 코드로 URL 을 만든다', () => {
    const url = new URL(getSyllabusUrl({ courseNumber: '033.001', lectureNumber: '001' }, { year: 2026, term: 3 })!);
    expect(url.origin + url.pathname).toBe('https://snutt-proxy.wafflestudio.com/sugang/cc/cc103.action');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      openSchyy: '2026',
      openShtmFg: 'U000200002',
      openDetaShtmFg: 'U000300001',
      sbjtCd: '033.001',
      ltNo: '001',
      sbjtSubhCd: '000',
    });
  });

  it('강좌번호나 분반이 없으면(직접 추가한 강의) null', () => {
    expect(getSyllabusUrl({ courseNumber: null, lectureNumber: '001' }, { year: 2026, term: 1 })).toBeNull();
    expect(getSyllabusUrl({ courseNumber: '033.001', lectureNumber: null }, { year: 2026, term: 1 })).toBeNull();
  });
});
