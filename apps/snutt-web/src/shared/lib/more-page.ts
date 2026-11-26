/**
 * 더보기 패널의 화면 (Figma `더보기` 섹션). 메인 화면의 URL(MainView)이 갖고, 더보기 패널(features/more)이 그린다.
 * menu 는 첫 목록이고 나머지는 목록에서 들어가는 화면이다.
 */
export type MorePage = 'menu' | 'account' | 'notifications' | 'color-mode' | 'timetable-settings' | 'feedback';

export const MORE_PAGES: readonly MorePage[] = [
  'menu',
  'account',
  'notifications',
  'color-mode',
  'timetable-settings',
  'feedback',
];

export const isMorePage = (value: string | null): value is MorePage => MORE_PAGES.includes(value as MorePage);
