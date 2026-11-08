export type ColorPair = { bg: string; fg: string };

/**
 * 강의 색상. 테마 팔레트의 몇 번째 색을 쓰거나, 사용자가 직접 고른 색을 쓴다.
 * (v2 API 의 paletteIndex / customColor)
 */
export type LectureColor = { type: 'palette'; index: number } | { type: 'custom'; color: ColorPair };

export type Theme = { id: string; name: string; colors: ColorPair[] };

/** 팔레트에 해당 색이 없을 때 쓰는 기본 색 */
export const FALLBACK_LECTURE_COLOR: ColorPair = { bg: '#94e6fe', fg: '#1579c2' };

export const resolveLectureColor = (color: LectureColor, palette: readonly ColorPair[]): ColorPair => {
  if (color.type === 'custom') return color.color;
  return palette[color.index] ?? FALLBACK_LECTURE_COLOR;
};

export const isSameLectureColor = (a: LectureColor, b: LectureColor) => {
  if (a.type === 'palette' && b.type === 'palette') return a.index === b.index;
  if (a.type === 'custom' && b.type === 'custom') return a.color.bg === b.color.bg && a.color.fg === b.color.fg;
  return false;
};

/**
 * 테마 목록에서 themeId 에 맞는 팔레트를 찾는다.
 * timetable-picker 와 메인 화면(paletteOf)에서 공통으로 쓴다.
 * 테마를 받기 전이거나 ID 가 없으면 빈 배열을 반환한다.
 */
export const findThemePalette = (themes: readonly Theme[], themeId: string | null | undefined): readonly ColorPair[] =>
  themes.find((theme) => theme.id === themeId)?.colors ?? [];
