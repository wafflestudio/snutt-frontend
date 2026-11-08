import { describe, expect, it } from 'vitest';

import { type ColorPair, FALLBACK_LECTURE_COLOR, findThemePalette, isSameLectureColor, resolveLectureColor, type Theme } from '@/domain/color';

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

describe('findThemePalette', () => {
  const themes: Theme[] = [
    { id: 'theme-1', name: 'SNUTT', colors: [{ bg: '#e54459', fg: '#ffffff' }] },
    { id: 'theme-2', name: 'Custom', colors: [{ bg: '#f58d3d', fg: '#ffffff' }] },
  ];

  it('themeId 에 맞는 테마의 팔레트를 반환한다', () => {
    expect(findThemePalette(themes, 'theme-1')).toEqual(themes[0]!.colors);
    expect(findThemePalette(themes, 'theme-2')).toEqual(themes[1]!.colors);
  });

  it('themeId 가 없는 테마면 빈 배열을 반환한다', () => {
    expect(findThemePalette(themes, 'unknown')).toEqual([]);
  });

  it('themeId 가 null 이면 빈 배열을 반환한다', () => {
    expect(findThemePalette(themes, null)).toEqual([]);
  });

  it('themeId 가 undefined 이면 빈 배열을 반환한다', () => {
    expect(findThemePalette(themes, undefined)).toEqual([]);
  });

  it('테마 목록이 비어 있으면 빈 배열을 반환한다', () => {
    expect(findThemePalette([], 'theme-1')).toEqual([]);
  });
});
