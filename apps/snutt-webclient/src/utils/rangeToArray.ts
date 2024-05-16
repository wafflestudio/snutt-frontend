export const rangeToArray = <T extends number>(start: T, end: T) =>
  Array.from({ length: end - start + 1 }, (_, i) => i + start) as T[]; // is this type-safe?
