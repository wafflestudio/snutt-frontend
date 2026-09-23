import { describe, expect, it } from 'vitest';

import { type ColorPair, FALLBACK_LECTURE_COLOR, isSameLectureColor, resolveLectureColor } from './color';

const palette: ColorPair[] = [
  { bg: '#e54459', fg: '#ffffff' },
  { bg: '#f58d3d', fg: '#ffffff' },
];

describe('resolveLectureColor', () => {
  it('팔레트 색은 해당 순서의 색을 쓴다', () => {
    expect(resolveLectureColor({ type: 'palette', index: 1 }, palette)).toEqual(palette[1]);
  });

  it('직접 고른 색은 팔레트와 상관없이 그 색을 쓴다', () => {
    const color = { bg: '#000000', fg: '#ffffff' };
    expect(resolveLectureColor({ type: 'custom', color }, palette)).toEqual(color);
  });

  it('팔레트에 없는 번호면 기본 색을 쓴다', () => {
    expect(resolveLectureColor({ type: 'palette', index: 2 }, palette)).toEqual(FALLBACK_LECTURE_COLOR);
    expect(resolveLectureColor({ type: 'palette', index: -1 }, palette)).toEqual(FALLBACK_LECTURE_COLOR);
    expect(resolveLectureColor({ type: 'palette', index: 0 }, [])).toEqual(FALLBACK_LECTURE_COLOR);
  });
});

describe('isSameLectureColor', () => {
  it('종류와 값이 모두 같아야 같다', () => {
    const custom = { bg: '#e54459', fg: '#ffffff' };
    expect(isSameLectureColor({ type: 'palette', index: 0 }, { type: 'palette', index: 0 })).toBe(true);
    expect(isSameLectureColor({ type: 'palette', index: 0 }, { type: 'palette', index: 1 })).toBe(false);
    expect(isSameLectureColor({ type: 'custom', color: custom }, { type: 'custom', color: { ...custom } })).toBe(true);
    // 결과 색이 같아도 종류가 다르면 다른 색 설정이다
    expect(isSameLectureColor({ type: 'palette', index: 0 }, { type: 'custom', color: custom })).toBe(false);
  });
});
