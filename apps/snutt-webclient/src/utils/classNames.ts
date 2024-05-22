export const classNames = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter((c) => typeof c === 'string').join(' ');
};
