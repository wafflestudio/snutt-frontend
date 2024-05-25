export const clsx = (...classes: (string | undefined | null | false)[]) =>
  classes.filter((c) => typeof c === 'string').join(' ');
