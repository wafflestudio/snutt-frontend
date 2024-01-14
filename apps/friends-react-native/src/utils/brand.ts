export type Brand<T extends NonNullable<unknown>, B extends string> = T & { __brand: B };

export const brand = <T extends NonNullable<unknown>, B extends string>(value: T, _: B) => value as Brand<T, B>;
