/**
 * Menu 와 Select 가 함께 쓰는 펼침 목록 모양.
 * Figma 에서 펼친 목록은 강의 상세의 색상 드롭다운 하나뿐이라 이것을 기준으로 맞췄다. (둥글기 8px, 그림자 0 0 10px 10%, 한 줄 49px, 줄 사이 선)
 */
export const POPUP_CLASSES =
  'max-h-(--available-height) overflow-y-auto rounded-lg bg-normal shadow-[0_0_10px_rgb(0_0_0/10%)] outline-none';

export const POPUP_ITEM_CLASSES =
  'flex cursor-pointer items-center justify-between gap-3 border-b border-line-lightest px-4 py-4 text-13-regular text-plain outline-none select-none last:border-b-0 data-disabled:cursor-not-allowed data-disabled:opacity-40 data-highlighted:bg-light';
