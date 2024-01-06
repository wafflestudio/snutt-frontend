export const classNames = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');
