export const arrayFromRange = (start: number, end: number) => {
  if (start > end) throw new Error();
  return [...Array(end - start + 1)].map((_, i) => start + i);
};
