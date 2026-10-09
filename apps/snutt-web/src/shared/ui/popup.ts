/**
 * Menu 와 Select 가 함께 쓰는 펼친 목록 모양. Figma `Web 컴포넌트` 의 `드롭다운` (학기 목록) 을 따른다.
 * 둥글기 8px, 테두리 1px, 그림자 0 0 10px 10%, 한 줄 42px(여백 12 · 16), 줄 사이 선 없음, 고를 줄은 회색 배경.
 */
export const POPUP_CLASSES =
  'max-h-(--available-height) overflow-y-auto rounded-lg border border-line-border bg-normal shadow-[0_0_10px_rgb(0_0_0/10%)] outline-none';

export const POPUP_ITEM_CLASSES =
  'flex cursor-pointer items-center justify-between gap-2.5 px-4 py-3 text-15-regular text-normal outline-none select-none data-disabled:cursor-not-allowed data-disabled:opacity-40 data-highlighted:bg-light-field';
